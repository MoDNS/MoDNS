#include "modns-sdk.h"

uint8_t decode_bytes(struct ByteVector req, struct DnsMessage *message);
uint8_t encode_bytes(struct DnsMessage msg, struct ByteVector *resp_buf);