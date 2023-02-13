#include<stdio.h>
#include "modns-sdk.h"

void impl_deserialize_req(const uint8_t *req, uintptr_t size, struct DnsMessage *message) {

    message->header.id = 10;

    resize_field(message, 1, Question);

    message->question[0].name = "example.com";
    message->question[0].class_code = 1;
    message->question[0].type_code = 1;

}