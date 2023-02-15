#include "plugin-common.h"

uint8_t impl_decode_req(const uint8_t *req, uintptr_t size, struct DnsMessage *message) {
    return decode_bytes(req, size, message);
}

uint8_t impl_encode_resp(struct DnsMessage resp, struct ByteVector *buf) {
    return encode_bytes(resp, buf);
}