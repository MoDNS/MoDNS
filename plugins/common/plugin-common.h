#include "modns-sdk.h"

uint8_t decode_bytes(const uint8_t *req, uintptr_t size, struct DnsMessage *message);
uint8_t encode_bytes(struct DnsMessage msg, struct ByteVector *resp_buf);