
#include "modns-sdk.h"

extern void impl_deserialize_req(const uint8_t *req, uintptr_t size, struct DnsMessage *message) {
    message->header.id = 10;

    DnsQuestion *question = malloc(sizeof(DnsQuestion));

    question[0].name = "example.com";
    question[0].class_code = 1;
    question[0].type_code = 1;

    message->question = question;
    message->header.qdcount = 1;
}