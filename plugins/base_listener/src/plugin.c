#include "plugin-common.h"

uint8_t impl_deserialize_req(const uint8_t *req, uintptr_t size, struct DnsMessage *message) {
    return deserialize_bytes(req, size, message);
}