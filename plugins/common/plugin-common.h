#include "modns-sdk.h"

uint8_t deserialize_bytes(const uint8_t *req, uintptr_t size, struct DnsMessage *message);
uintptr_t decode_question(const uint8_t *req, uintptr_t req_size, struct DnsQuestion *question);
uintptr_t decode_rr(const uint8_t *req, uintptr_t req_size, struct DnsResourceRecord *rr);
uintptr_t decode_label_list(const uint8_t *req, uintptr_t req_size, struct BytePtrVector *vec);
