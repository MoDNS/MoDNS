#include "plugin-common.h"

uint8_t impl_listener_sync_decode_req(const struct ByteVector *req, struct DnsMessage *message, const void *state) {
    return decode_bytes(*req, message);
}

uint8_t impl_listener_sync_encode_resp(const struct DnsMessage *resp, struct ByteVector *buf, const void *state) {
    return encode_bytes(*resp, buf);
}
