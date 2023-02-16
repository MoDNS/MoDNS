#include "plugin-common.h"

uint8_t impl_decode_req(struct ByteVector req, struct DnsMessage *message) {
    return decode_bytes(req, message);
}

uint8_t impl_encode_resp(struct DnsMessage resp, struct ByteVector *buf) {
    return encode_bytes(resp, buf);
}