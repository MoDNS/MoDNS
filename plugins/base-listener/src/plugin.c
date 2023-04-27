#include "plugin-common.h"
#include <errno.h>
#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/poll.h>
#include <unistd.h>
#include <fcntl.h>

typdef struct PluginState {
    int udpfd;
    int tcpfd;
} PluginState;

uint8_t impl_listener_sync_decode_req(const struct ByteVector *req, struct DnsMessage *message, const void *state) {
    return decode_bytes(*req, message);
}

uint8_t impl_listener_sync_encode_resp(const struct DnsMessage *resp, struct ByteVector *buf, const void *state) {
    return encode_bytes(*resp, buf);
}

uint8_t impl_listener_async_poll(struct DnsMessage req, void **req_state, const void *plugin_state) {

    PluginState *sockfds = (PluginState *)plugin_state;

    struct pollfd pollfds[2];

    pollfds[0].fd = sockfds->udpfd;
    pollfds[0].events = POLLIN;
    pollfds[1].fd = sockfds->tcpfd;
    pollfds[1].events = POLLIN;

    int ready = poll(pollfds, 2, -1);

    if (ready < 0) {
        modns_log_cstr(0, "Got error while polling");
        modns_log_cstr(3, strerror(errno));
        return 1;
    }

    if (ready == 0) {
        return 1;
    }

    if (pollfds[0].revents & POLLIN) {
        // Allocate buffer and read into it
        return 0;
    }

    if (pollfds[1].revents & POLLIN) {
        // ditto
        return 0;
    }

    return 1;

}

void *impl_plugin_setup() {

    PluginState *rv = malloc(sizeof(PluginState));

    int udpfd = socket(AF_INET, SOCK_STREAM, 0);

    int tcpfd = socket(AF_INET, SOCK_DGRAM, 0);

    struct sockaddr_in tcp_addr, udp_addr;

    tcp_addr.sin_family = AF_INET;
    tcp_addr.sin_addr.s_addr = INADDR_ANY;
    tcp_addr.sin_port = htons(53);

    udp_addr.sin_family = AF_INET;
    udp_addr.sin_addr.s_addr = INADDR_ANY;
    udp_addr.sin_port = htons(53);

    if (bind(tcpfd, (struct sockaddr *)&tcp_addr, sizeof(tcp_addr)) < 0) {
        modns_log_cstr("Failed to bind TCP listener");
        free(rv);
        return NULL;
    }

    if (bind(udpfd, (struct sockaddr *)&tcp_addr, sizeof(tcp_addr)) < 0) {
        modns_log_cstr("Failed to bind UDP listener");
        free(rv);
        return NULL;
    }

    rv->udpfd = udpfd;
    rv->tcpfd = tcpfd;

    return rv;
}

