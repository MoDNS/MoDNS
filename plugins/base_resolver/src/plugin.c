#include <sys/socket.h>
#include <arpa/inet.h>
#include <stdio.h>

#include "plugin-common.h"

#define MAX_DNS_DGRAM_SIZE 512

extern uint8_t impl_resolve_req(const struct DnsMessage *req, struct DnsMessage *resp) {

#ifdef DEBUG
    printf("Starting resolver\n");
#endif

    int sock = socket(AF_INET, SOCK_DGRAM, 17); // UDP socket

    if (sock == -1) {return 2;}

    struct sockaddr_in server_addr;

    server_addr.sin_addr.s_addr = inet_addr("8.8.8.8");
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(53);

    if (sock == -1) {return 2;} // TODO: Add logging so we can do something with ERRNO here

#ifdef DEBUG
    printf("Encoding request\n");
#endif

    struct ByteVector buf = {NULL, 0, 0};
    buf = extend_char_vec(buf, MAX_DNS_DGRAM_SIZE);
    uint8_t rc = encode_bytes(*req, &buf);
    if (rc != 0) {return rc;}

    if (connect(sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {return 2;}

    if( send(sock, buf.ptr, buf.size, 0) < 0) {
        return 2;
    }

    buf.size = 0;

#ifdef DEBUG
    printf("Waiting for response\n");
#endif

    int len_recvd = recv(sock, buf.ptr, MAX_DNS_DGRAM_SIZE, 0);

#ifdef DEBUG
    printf("Response received, decoding\n");
#endif

    if (len_recvd < 0) {return 2;}

    buf.size = len_recvd;

    rc = decode_bytes(buf, resp);
    if (rc != 0) {return rc;}

#ifdef DEBUG
    printf("Successfully decoded response\n");
#endif

    return 0;
}