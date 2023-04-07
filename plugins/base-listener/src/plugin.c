#include "plugin-common.h"

uint8_t impl_listener_sync_decode_req(struct ByteVector req, struct DnsMessage *message, void *state) {
    return decode_bytes(req, message);
}

uint8_t impl_listener_sync_encode_resp(const struct DnsMessage *resp, struct ByteVector *buf, void *state) {
    return encode_bytes(*resp, buf);
}
