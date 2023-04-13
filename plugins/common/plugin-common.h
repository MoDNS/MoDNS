#include "modns-sdk.h"

uint8_t decode_bytes(struct ByteVector req, struct DnsMessage *message);
uint8_t encode_bytes(struct DnsMessage msg, struct ByteVector *resp_buf);
void modns_log(uint8_t log_level, uintptr_t buf_size, char *format, ...);

