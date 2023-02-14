#include "plugin-common.h"

uintptr_t get_serialized_size(struct DnsMessage msg);

uint8_t serialize_bytes(struct DnsMessage msg, struct ByteVector *resp_buf) {
    uintptr_t resp_size = get_serialized_size(msg);

    bool truncation_required = false;

    if (resp_size > 512) {
        resp_size = 512;
        truncation_required = true;
    }

    *resp_buf = extend_char_vec(*resp_buf, resp_size - resp_buf->capacity);
    resp_buf->size = resp_size;

    resp_buf->ptr[0] = msg.header.id & 0x00ff;
    resp_buf->ptr[1] = (msg.header.id & 0xff00) >> 8;

    uint8_t bitflags_msb = 0x00;
    if (msg.header.is_response)             { bitflags_msb |= 0b10000000; }
    if (msg.header.authoritative_answer)    { bitflags_msb |= 0b00000100; }
    if (truncation_required)                { bitflags_msb |= 0b00000010; }
    if (msg.header.recursion_desired)       { bitflags_msb |= 0b00000001; }

    bitflags_msb |= (msg.header.opcode & 0b00001111) << 3;

    resp_buf->ptr[2] = bitflags_msb;

    uint8_t bitflags_lsb = 0x00;
    if (msg.header.recursion_available)     { bitflags_lsb |= 0b10000000; }
    bitflags_lsb |= msg.header.response_code & 0b00001111;

    resp_buf->ptr[3] = bitflags_lsb;

    resp_buf->ptr[4] = msg.header.qdcount & 0x00ff;
    resp_buf->ptr[5] = (msg.header.qdcount & 0xff00) >> 8;

    return 0;
}

uintptr_t get_serialized_size(struct DnsMessage msg) {
    uintptr_t total = 12; // Header length

    for (uint16_t i = 0; i < msg.header.qdcount; i++) {
        total += msg.question[i].name.size;
    }

    for (uint16_t i = 0; i < msg.header.ancount; i++) {
        total += msg.answer[i].name.size;
    }

    for (uint16_t i = 0; i < msg.header.nscount; i++) {
        total += msg.authority[i].name.size;
    }

    for (uint16_t i = 0; i < msg.header.arcount; i++) {
        total += msg.additional[i].name.size;
    }

    return total;
}