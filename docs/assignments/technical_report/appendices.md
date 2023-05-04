\pagebreak
# Appendix

MoDNS Project Github Link:  
https://github.com/MoDNS/MoDNS
  
  
RFC 1035:  
https://datatracker.ietf.org/doc/html/rfc1035
  
  
Plugin Example:  
  
```C
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
    uint16_t num_connections;
    uint16_t max_connections;
    pthread_mutex_t connections_lock;
} PluginState;

PluginState *allocate_state(uint16_t);
void free_state(PluginState*);

void end_connection(TcpConnection*);

// Deprecated, leaving in for integration tests
uint8_t impl_listener_sync_decode_req(const struct ByteVector *req, struct DnsMessage *message, const void *state) {
    return decode_bytes(*req, message);
}

// Deprecated, leaving in for integration tests
uint8_t impl_listener_sync_encode_resp(const struct DnsMessage *resp, struct ByteVector *buf, const void *state) {
    return encode_bytes(*resp, buf);
}

uint8_t impl_listener_async_poll(struct DnsMessage *req, void **req_state, const void *state_ptr) {

    if (state_ptr == NULL) {
        // it brokey :(
        return 2;
    }

    PluginState *state = (PluginState *)state_ptr;

    // Start by polling for updates
    struct pollfd pollfds[state->num_connections + 2];

    // Poll active TCP connections
    for (uint16_t i = 0; i < state->num_connections; i++) {
        pollfds[i].fd = state->connections[i].sock;
        pollfds[i].events = POLLIN | POLLHUP;
    }

    // Poll listeners last
    pollfds[state->num_connections].fd = state->udplistener;
    pollfds[state->num_connections].events = POLLIN;
    pollfds[state->num_connections + 1].fd = state->tcplistener;
    pollfds[state->num_connections + 1].events = POLLIN;

    uint32_t num_polls = state->num_connections + 2;

    int events = poll(pollfds, num_polls, 5);

    if (events < 0) {
        modns_log(0, 255, "Got error while polling: %s", strerror(errno));
        return 1;
    }

    if (events > 0) {
        modns_log(4, 255, "Got %d events, %d connections are active", events, state->num_connections);
    }

    // The list of connections might change unexpectedly if a response is generated.
    // Thus, mutex
    int lock_rc = pthread_mutex_trylock(&state->connections_lock);
    if (lock_rc < 0) {

        modns_log(4, 255, "Couldn't acquire mutex lock on TCP connections: %s (rc: %d)", strerror(errno), lock_rc);

        if (errno == EBUSY) {
            return 1;
        }

        modns_log(0, 255, "Attempt to acquire lock on TCP connections failed: %s", strerror(errno));
        return 2;
    }

    // Handle messages from open TCP connections
    for (uint8_t i = 0; i < state->num_connections; i++) {

        if (events == 0) {
            pthread_mutex_unlock(&state->connections_lock);
            return 1;
        }

        
        if(pollfds[i].revents == 0) {
            modns_log(4, 40, "No events on connection %d", i);
            continue;
        }

        modns_log(4, 250, "Got event on connection %d (fd %d): 0x%04X", i, pollfds[i].fd, pollfds[i].revents);

        // We've found one of the events, so decrement the counter of events to handle
        events--;

        // Handle errors
        if (pollfds[i].revents == POLLHUP) {
            modns_log(1, 70, "TCP connection at file descriptior %d closed unexpectedly", pollfds[i].fd);
            end_connection(state->connections + i);
            state->connections[i--] = state->connections[--state->num_connections];
            return 1;
        }

        if(pollfds[i].revents != POLLIN) {
            modns_log(1, 65, "Got unexpected event from polling a TCP socket: 0x%04X", pollfds[i].revents);
            end_connection(state->connections + i);
            state->connections[i--] = state->connections[--state->num_connections];
            pthread_mutex_unlock(&state->connections_lock);
            return 1;

        }

        // First, get the expected size of the message if we don't have it
        if (state->connections[i].size == 0) {
            uint16_t size = 0;
            ssize_t rc = recv(state->connections[i].sock, &size, 2, MSG_WAITALL | MSG_DONTWAIT);

            if (rc < 0) {
                // recv() returned an error
                if (errno == EWOULDBLOCK || errno == EAGAIN) {
                    continue;
                }

                modns_log(0, 256, "Got error while reading message length from a TCP socket: %s", strerror(errno));

                // Close the connection and remove it from the list of open connections
                end_connection(state->connections + i);
                state->connections[i--] = state->connections[--state->num_connections];
                pthread_mutex_unlock(&state->connections_lock);
                return 1;
            }

            // The socket may have just completed a request and closed
            if (rc == 0) {
                modns_log(3, 50, "TCP Connection closed by client (fd %d)", state->connections[i].sock);

                end_connection(state->connections + i);
                state->connections[i--] = state->connections[--state->num_connections];
                pthread_mutex_unlock(&state->connections_lock);
                return 1;
            }

            if (rc != 2) {
                modns_log(0, 256, "Got unexpected message length while reading message length from a TCP socket: %d", rc);

                // Close the connection and remove it from the list of open connections
                end_connection(state->connections + i);
                state->connections[i--] = state->connections[--state->num_connections];
                pthread_mutex_unlock(&state->connections_lock);
                return 1;
            }

            state->connections[i].size = ntohs(size);
            state->connections[i].buf = malloc(state->connections[i].size);

            if (size == 0) {
                modns_log_cstr(3, "Got 0-length message");
            }
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
            state->connections[i--] = state->connections[--state->num_connections];
            pthread_mutex_unlock(&state->connections_lock);
            return 1;
        }

        // The socket may have just completed a request and closed
        if (rc == 0) {
            modns_log(3, 256, "Connection unexpectedly closed on TCP socket %d", state->connections[i].sock);

            end_connection(state->connections + i);
            state->connections[i--] = state->connections[--state->num_connections];
            pthread_mutex_unlock(&state->connections_lock);
            return 1;
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
                state->connections[i--] = state->connections[--state->num_connections];
                pthread_mutex_unlock(&state->connections_lock);
                return 1;
            }

            // Pop the connection off and store it in `request_state`
            RequestState *responder = malloc(sizeof(RequestState));
            responder->tcp = true;
            responder->tcp_conn.sock = state->connections[i].sock;
            free(state->connections[i].buf);
            responder->tcp_conn.buf = NULL;
            responder->tcp_conn.size = 0;
            responder->tcp_conn.recvd = 0;
            state->connections[i--] = state->connections[--state->num_connections];

            *req_state = responder;

            pthread_mutex_unlock(&state->connections_lock);
            return 0;
        }
    }

    pthread_mutex_unlock(&state->connections_lock);

    if (events == 0) {
        return 1;
    }

    // Handle incoming UDP stream
    if (pollfds[num_polls-2].revents) {

        modns_log_cstr(4, "Got event on UDP");

        if (pollfds[num_polls-2].revents != POLLIN) {
            modns_log(0, 64, "UDP Listener encountered an error (poll returned 0x%4X)", pollfds[num_polls-2].revents);
            return 2;
        }

        // Socket read here
        struct sockaddr addr;
        socklen_t addr_len = sizeof(addr);
        ssize_t rc = recvfrom(state->udplistener, state->udp_buf, state->buffer_len, MSG_DONTWAIT, &addr, &addr_len);

        struct sockaddr_in *addr_in = (struct sockaddr_in *)&addr;

        char remotestr[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &addr_in->sin_addr, remotestr, INET_ADDRSTRLEN);

        modns_log(3, 256, "Recieved UDP request from %s:%d", remotestr, addr_in->sin_port);

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

        modns_log_cstr(4, "Got event on TCP");

        if (pollfds[num_polls-1].revents != POLLIN) {
            modns_log(0, 64, "TCP Listener encountered an error (poll returned 0x%4X)", pollfds[num_polls-1].revents);
            return 2;
        }

        struct sockaddr remote;
        socklen_t remotelen = sizeof(remote);

        pthread_mutex_lock(&state->connections_lock);
        int conn_sock = accept(state->tcplistener, &remote, &remotelen);

        if (conn_sock < 0) {
            modns_log(0, 255, "Failed to accept a TCP connection: %s", strerror(errno));
            pthread_mutex_unlock(&state->connections_lock);
            return 2;
        }

        struct sockaddr_in *remote_in = (struct sockaddr_in *)&remote;

        char remotestr[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &remote_in->sin_addr, remotestr, INET_ADDRSTRLEN);

        modns_log(3, 256, "Recieved TCP request from %s:%d", remotestr, remote_in->sin_port);

        if (state->num_connections >= state->max_connections) {
            close(conn_sock);
            modns_log_cstr(1, "A TCP connection was dropped because the maximum number of open connections has been reached");
            pthread_mutex_unlock(&state->connections_lock);
            return 1;
        }

        TcpConnection new_conn;
        new_conn.sock = conn_sock;
        new_conn.buf = NULL;
        new_conn.size = 0;
        new_conn.recvd = 0;

        state->connections[state->num_connections++] = new_conn;
        pthread_mutex_unlock(&state->connections_lock);



        modns_log(100, 4, "TCP socket at fd %d added to connection queue, there are now %d open connections", new_conn.sock, state->num_connections);

    }

    return 1;

}

uint8_t impl_listener_async_respond(const struct DnsMessage *resp, void *req_state_ptr, const void *state_ptr) {

    if (req_state_ptr == NULL || state_ptr == NULL) {
        // Something broke
        return 1;
    }

    RequestState *req_state = (RequestState *)req_state_ptr;
    PluginState *state = (PluginState *)state_ptr;

    ByteVector resp_bytes;
    resp_bytes.ptr = NULL;
    resp_bytes.size = 0;
    resp_bytes.capacity = 0;


    // Encode the response
    if (encode_bytes(*resp, &resp_bytes) != 0) {
        modns_log_cstr(1, "Failed to encode a response");
        end_connection(&req_state->tcp_conn);
        drop_char_vec(resp_bytes);
        return 1;
    }

    if (req_state->tcp) {
        // Respond to the request over TCP
        modns_log_cstr(3, "Sending response over TCP");
        modns_log(4, 35, "Sending response over fd %d", req_state->tcp_conn.sock);

        uint16_t msglen_header = htons(resp_bytes.size);
        ssize_t rc = send(req_state->tcp_conn.sock, &msglen_header, 2, 0);

        if (rc >= 0) {
            rc = send(req_state->tcp_conn.sock, resp_bytes.ptr, resp_bytes.size, 0);
        }

        if (rc < 0) {
            modns_log(1, 255, "Encountered an error sending a reply over TCP: %s", strerror(errno));
            drop_char_vec(resp_bytes);
            end_connection(&req_state->tcp_conn);
            return 1;
        }

        modns_log(4, 50, "Successfully sent %d-byte reply over TCP fd %d", rc, req_state->tcp_conn.sock);

        req_state->tcp_conn.recvd = 0;
        req_state->tcp_conn.size = 0;
        free(req_state->tcp_conn.buf);
        req_state->tcp_conn.buf = NULL;

        // Return this connection to the active connection list, in case it sends another request
        pthread_mutex_lock(&state->connections_lock);
        state->connections[state->num_connections++] = req_state->tcp_conn;
        pthread_mutex_unlock(&state->connections_lock);

    } else {
        // UDP
        ssize_t rc = sendto(state->udplistener, resp_bytes.ptr, resp_bytes.size, 0, &req_state->udp_conn.addr, req_state->udp_conn.addr_len);

        if (rc < 0) {
            modns_log(1, 255, "Encountered an error sending a reply over UDP: %s", strerror(errno));
            drop_char_vec(resp_bytes);
            return 1;
        }
    }

    drop_char_vec(resp_bytes);
    return 0;
}

void *impl_plugin_setup() {

    PluginState *state = allocate_state(512);

    int udpfd = socket(AF_INET, SOCK_DGRAM, 0);

    int tcpfd = socket(AF_INET, SOCK_STREAM, 0);

    struct sockaddr_in tcp_addr, udp_addr;

    // Bind listener sockets
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

    modns_log_cstr(2, "Ready to receive requests on UDP port 53");

    if (bind(tcpfd, (struct sockaddr *)&tcp_addr, sizeof(tcp_addr)) < 0) {
        modns_log_cstr(0, "Failed to bind TCP listener");
        free_state(state);
        return NULL;
    }

    if (listen(tcpfd, 5) < 0) {
        modns_log(0, 255, "Failed to listen on TCP listener: %s", strerror(errno));
        free_state(state);
        return NULL;
    }

    modns_log_cstr(2, "Ready to receive requests on TCP port 53");

    state->udplistener = udpfd;
    state->tcplistener = tcpfd;

    return state;
}

void impl_plugin_teardown(void *state_ptr) {

    if (state_ptr == NULL) {
        modns_log_cstr(1, "Teardown function received unexpected null pointer");
        return;
    }

    PluginState *state = (PluginState *)state_ptr;

    modns_log_cstr(3, "Closing UDP listener");
    close(state->udplistener);
    modns_log_cstr(3, "Closing TCP listener");
    close(state->tcplistener);

    modns_log_cstr(3, "Closing active TCP connections");
    for(uint8_t i = 0; i < state->num_connections; i++) {
        close(state->connections[i].sock);
        free(state->connections[i].buf);
    }

    modns_log_cstr(3, "Cleaning up");
    free_state(state);
    modns_log_cstr(2, "Successfully disabled");
}

void end_connection(TcpConnection *conn) {
    close(conn->sock);
    free(conn->buf);

    conn->sock = 0;
    conn->buf = NULL;
    conn->size = 0;
    conn->recvd = 0;
}

PluginState *allocate_state(uint16_t max_connections) {

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
```




