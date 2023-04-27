
#include "plugin-common.h"
#include <pthread.h>
#include <asm-generic/errno-base.h>
#include <asm-generic/errno.h>
#include <errno.h>
#include <stdint.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/poll.h>
#include <sys/types.h>
#include <unistd.h>
#include <fcntl.h>

typedef struct TcpConnection {
    int sock;
    char *buf;
    uint16_t size;
    uint16_t recvd;
} TcpConnection;

typedef struct RequestState {
    bool tcp;
    union {
        TcpConnection tcp_conn;

        struct {
            struct sockaddr addr;
            socklen_t addr_len;
        } udp_conn;
    };
} RequestState;

typedef struct PluginState {
    int udplistener;
    int tcplistener;

    char *udp_buf;
    uintptr_t buffer_len;

    TcpConnection *connections;
    uint8_t num_connections;
    uint8_t max_connections;
    pthread_mutex_t connections_lock;
} PluginState;

PluginState *allocate_state(uint8_t);
void free_state(PluginState*);

void end_connection(TcpConnection*);

uint8_t impl_listener_sync_decode_req(const struct ByteVector *req, struct DnsMessage *message, const void *state) {
    return decode_bytes(*req, message);
}

uint8_t impl_listener_sync_encode_resp(const struct DnsMessage *resp, struct ByteVector *buf, const void *state) {
    return encode_bytes(*resp, buf);
}

uint8_t impl_listener_async_poll(struct DnsMessage *req, void **req_state, const void *state_ptr) {

    PluginState *state = (PluginState *)state_ptr;

    struct pollfd pollfds[state->num_connections + 2];

    for (int i = 0; i < state->num_connections; i++) {
        pollfds[i].fd = state->connections[i].sock;
        pollfds[i].events = POLLIN;
    }

    pollfds[state->num_connections].fd = state->udplistener;
    pollfds[state->num_connections].events = POLLIN;
    pollfds[state->num_connections + 1].fd = state->tcplistener;
    pollfds[state->num_connections + 1].events = POLLIN;

    uint16_t num_polls = state->num_connections + 2;

    int events = poll(pollfds, num_polls, -1);

    if (events < 0) {
        modns_log_cstr(0, "Got error while polling");
        modns_log_cstr(3, strerror(errno));
        return 1;
    }

    if (pthread_mutex_trylock(&state->connections_lock) != 0) {
        if (errno == EBUSY) {
            return 1;
        }

        modns_log(0, 255, "Attempt to acquire lock on TCP connections failed: ", strerror(errno));
        return 2;
    }

    // Handle messages from open TCP connections
    //
    // Number and order of active connections may change, so we need to keep track
    // of our position in list of connections (i) and list of poll results (j)
    for (int i,j = 0; i < state->num_connections && j < num_polls - 2; i++,j++) {

        if (events == 0) {
            pthread_mutex_unlock(&state->connections_lock);
            return 1;
        }

        
        if(pollfds[j].revents) {
            continue;
        }

        // We've found one of the events, so decrement the counter of events to handle
        events--;

        // First, get the size if we don't have it
        if (state->connections[i].size == 0) {
            uint16_t size = 0;
            ssize_t rc = recv(state->connections[i].sock, &size, 2, MSG_WAITALL | MSG_DONTWAIT);

            if (rc < 0) {
                if (errno == EWOULDBLOCK || errno == EAGAIN) {
                    continue;
                }

                modns_log(0, 256, "Got error while reading message length from a TCP socket: %s", strerror(errno));

                // Close the connection and remove it from the list of open connections
                end_connection(state->connections + i);
                state->connections[i--] = state->connections[state->num_connections--];
                continue;
            }

            if (rc != 2) {
                modns_log(0, 256, "Got unexpected message length while reading message length from a TCP socket: %s", strerror(errno));

                // Close the connection and remove it from the list of open connections
                end_connection(state->connections + i);
                state->connections[i--] = state->connections[state->num_connections--];
                continue;
            }

            state->connections[i].size = ntohs(size);
            state->connections[i].buf = malloc(state->connections[i].size);
        }

        // Then, read as much as we can into conn.buf
        ssize_t rc = recv(state->connections[i].sock, state->connections[i].buf + state->connections[i].recvd, state->connections[i].size - state->connections[i].recvd, MSG_DONTWAIT);

        if (rc < 0) {
            if (errno == EWOULDBLOCK || errno == EAGAIN) {
                continue;
            }

            modns_log(0, 256, "Got error while reading from a TCP socket: %s", strerror(errno));

            // Close the connection and remove it from the list of open connections
            end_connection(state->connections + i);
            state->connections[i--] = state->connections[state->num_connections--];
            continue;
        }

        state->connections[i].recvd += rc;

        // The connection has finished receiving the request
        if (state->connections[i].recvd <= state->connections[i].size) {

            ByteVector msg_bytes;
            msg_bytes.ptr = state->connections[i].buf;
            msg_bytes.size = state->connections[i].recvd;
            msg_bytes.capacity = state->connections[i].size;

            if (decode_bytes(msg_bytes, req) != 0) {
                modns_log_cstr(1, "Failed to decode a request");
                end_connection(state->connections + i);
                state->connections[i--] = state->connections[state->num_connections--];
                continue;
            }

            // Pop the connection off and store it in `request_state`
            RequestState *responder = malloc(sizeof(RequestState));
            responder->tcp = true;
            responder->tcp_conn = state->connections[i];
            state->connections[i--] = state->connections[state->num_connections--];

            *req_state = responder;

            pthread_mutex_unlock(&state->connections_lock);
            return 0;
        }

        pthread_mutex_unlock(&state->connections_lock);

        if (events == 0) {
            return 1;
        }

        // Handle incoming UDP stream
        if (pollfds[num_polls-2].revents) {

            if (pollfds[num_polls-2].revents != POLLIN) {
                modns_log(0, 64, "UDP Listener encountered an error (poll returned %d)", pollfds[state->num_connections].revents);
                return 2;
            }

            struct sockaddr addr;
            socklen_t addr_len = 0;
            ssize_t rc = recvfrom(state->udplistener, state->udp_buf, state->buffer_len, MSG_DONTWAIT, &addr, &addr_len);

            if (rc < 0 && !(errno == EWOULDBLOCK || errno == EAGAIN)) {
                modns_log(0, 255, "Got error reading from UDP listener: %s", strerror(errno));
                return 2;
            }

            if (rc == 0) {
                modns_log_cstr(0, "UDP listener closed unexpectedly");
                return 2;
            }

            if (rc > 0) {
                ByteVector req_bytes;
                req_bytes.ptr = state->udp_buf;
                req_bytes.size = rc;
                req_bytes.capacity = state->buffer_len;

                if (decode_bytes(req_bytes, req) == 0) {
                    RequestState *responder = malloc(sizeof(RequestState));
                    responder->tcp = false;
                    responder->udp_conn.addr = addr;
                    responder->udp_conn.addr_len = addr_len;

                    *req_state = responder;

                    return 0;
                } else {
                    modns_log_cstr(1, "Failed to decode a request");
                }

            }

        }

        // Handle incoming TCP connections
        if (pollfds[num_polls-1].revents) {

            if (pollfds[num_polls-1].revents != POLLIN) {
                modns_log(0, 64, "TCP Listener encountered an error (poll returned %d)", pollfds[state->num_connections].revents);
                return 2;
            }

            int conn_sock = accept(state->tcplistener, NULL, NULL);

            if (conn_sock < 0) {
                modns_log(0, 255, "Failed to accept a TCP connection: %s", strerror(errno));
                return 2;
            }

            if (state->num_connections >= state->max_connections) {
                close(conn_sock);
                modns_log_cstr(1, "A TCP connection was dropped because the maximum number of open connections has been reached");
                return 1;
            }

            TcpConnection new_conn;
            new_conn.sock = conn_sock;
            new_conn.buf = NULL;
            new_conn.size = 0;
            new_conn.recvd = 0;

            state->connections[state->num_connections++] = new_conn;

        }
    }

    return 1;

}

uint8_t impl_listener_async_respond(const struct DnsMessage *resp, void *req_state_ptr, const void *state_ptr) {

    RequestState *req_state = (RequestState *)req_state_ptr;
    PluginState *state = (PluginState *)state_ptr;

    ByteVector resp_bytes;
    resp_bytes.ptr = NULL;
    resp_bytes.size = 0;
    resp_bytes.capacity = 0;

    if (encode_bytes(*resp, &resp_bytes) != 0) {
        modns_log_cstr(1, "Failed to encode a response");
        drop_char_vec(resp_bytes);
        return 1;
    }

    if (req_state->tcp) {
        ssize_t rc = send(req_state->tcp_conn.sock, resp_bytes.ptr, resp_bytes.size, 0);

        if (rc < 0) {
            modns_log(1, 255, "Encountered an error sending a reply: %s", strerror(errno));
            drop_char_vec(resp_bytes);
            return 1;
        }

        req_state->tcp_conn.recvd = 0;
        req_state->tcp_conn.size = 0;

        pthread_mutex_lock(&state->connections_lock);
        state->connections[state->num_connections++] = req_state->tcp_conn;
        pthread_mutex_unlock(&state->connections_lock);

    } else {
        // UDP
        ssize_t rc = sendto(state->udplistener, resp_bytes.ptr, resp_bytes.size, 0, &req_state->udp_conn.addr, req_state->udp_conn.addr_len);

        if (rc < 0) {
            modns_log(1, 255, "Encountered an error sending a reply: %s", strerror(errno));
            drop_char_vec(resp_bytes);
            return 1;
        }
    }

    drop_char_vec(resp_bytes);
    return 0;
}

void *impl_plugin_setup() {

    PluginState *state = allocate_state(2);

    int udpfd = socket(AF_INET, SOCK_STREAM, 0);

    int tcpfd = socket(AF_INET, SOCK_DGRAM, 0);

    struct sockaddr_in tcp_addr, udp_addr;

    udp_addr.sin_family = AF_INET;
    udp_addr.sin_addr.s_addr = INADDR_ANY;
    udp_addr.sin_port = htons(53);

    tcp_addr.sin_family = AF_INET;
    tcp_addr.sin_addr.s_addr = INADDR_ANY;
    tcp_addr.sin_port = htons(53);

    if (bind(udpfd, (struct sockaddr *)&udp_addr, sizeof(udp_addr)) < 0) {
        modns_log_cstr(0, "Failed to bind UDP listener");
        free_state(state);
        return NULL;
    }

    if (bind(tcpfd, (struct sockaddr *)&tcp_addr, sizeof(tcp_addr)) < 0) {
        modns_log_cstr(0, "Failed to bind TCP listener");
        free_state(state);
        return NULL;
    }

    if (listen(tcpfd, 5) < 0) {
        modns_log_cstr(0, "Failed to listen on TCP listener");
        free_state(state);
        return NULL;
    }

    state->udplistener = udpfd;
    state->tcplistener = tcpfd;

    return state;
}

void impl_plugin_teardown(void *state_ptr) {

    PluginState *state = (PluginState *)state_ptr;

    close(state->udplistener);
    close(state->tcplistener);

    for(uint8_t i = 0; i < state->num_connections; i++) {
        close(state->connections[i].sock);
        free(state->connections[i].buf);
    }

    free_state(state);
}

void end_connection(TcpConnection *conn) {
    close(conn->sock);
    free(conn->buf);

    conn->sock = 0;
    conn->buf = NULL;
    conn->size = 0;
    conn->recvd = 0;
}

PluginState *allocate_state(uint8_t max_connections) {

    PluginState *state = malloc(sizeof(PluginState));

    state->tcplistener = 0;
    state->udplistener = 0;

    state->udp_buf = malloc(sizeof(char) * 65507);
    state->buffer_len = 65507;

    state->connections = malloc(sizeof(TcpConnection) * max_connections);
    memset(state->connections, 0, sizeof(TcpConnection) * max_connections);
    state->num_connections = 0;

    state->max_connections = max_connections;

    pthread_mutex_init(&state->connections_lock, NULL);

    return state;
}

void free_state(PluginState *state) {

    free(state->connections);

    free(state);
}
