#include "plugin-common.h"

uintptr_t serialize_question(struct DnsQuestion question, struct ByteVector resp_buf, uintptr_t initial_offset);
uintptr_t get_serialized_size(struct DnsMessage msg);
uintptr_t get_qd_serialized_size(uint16_t count, struct DnsQuestion *qlist);
uintptr_t get_rr_serialized_size(uint16_t count, struct DnsResourceRecord *rrlist);

uint8_t serialize_bytes(struct DnsMessage msg, struct ByteVector *resp_buf) {
    uintptr_t resp_size = get_serialized_size(msg);

    bool truncation_required = false;

    if (resp_size > 512) {
        resp_size = 512;
        truncation_required = true;
    }

    // Header
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

    resp_buf->ptr[6] = msg.header.ancount & 0x00ff;
    resp_buf->ptr[7] = (msg.header.ancount & 0xff00) >> 8;

    resp_buf->ptr[8] = msg.header.nscount & 0x00ff;
    resp_buf->ptr[9] = (msg.header.nscount & 0xff00) >> 8;

    resp_buf->ptr[10] = msg.header.arcount & 0x00ff;
    resp_buf->ptr[11] = (msg.header.arcount & 0xff00) >> 8;

    uintptr_t cursor = 12;

    // Questions
    for (uintptr_t i = 0; i < msg.header.qdcount; i++) {
        cursor = serialize_question(msg.question[i], *resp_buf, cursor);
    }

    return 0;
}

uintptr_t serialize_question(struct DnsQuestion question, struct ByteVector resp_buf, uintptr_t initial_offset) {
    uintptr_t cursor = initial_offset;

    // Loop over labels in a question
    for (uintptr_t j = 0; j < question.name.size; j++) {
        resp_buf.ptr[cursor++] = question.name.size;

        // Loop over chars in a label
        for (uintptr_t k = 0; k < question.name.ptr[j].size; k++) {
            resp_buf.ptr[cursor++] = question.name.ptr[j].ptr[k];
        }
    }

    resp_buf.ptr[cursor++] = question.type_code & 0x00ff;
    resp_buf.ptr[cursor++] = (question.type_code & 0xff00) >> 8;

    resp_buf.ptr[cursor++] = question.class_code & 0x00ff;
    resp_buf.ptr[cursor++] = (question.class_code & 0xff00) >> 8;

    return cursor;
}

uintptr_t get_serialized_size(struct DnsMessage msg) {
    uintptr_t total = 12; // Header length

    total += get_qd_serialized_size(msg.header.qdcount, msg.question);

    total += get_rr_serialized_size(msg.header.ancount, msg.answer);

    total += get_rr_serialized_size(msg.header.nscount, msg.authority);

    total += get_rr_serialized_size(msg.header.arcount, msg.additional);

    return total;
}

uintptr_t get_qd_serialized_size(uint16_t count, struct DnsQuestion *qlist) {
    uintptr_t total = 0;
    for (uint16_t i = 0; i < count; i++) {
        total += qlist[i].name.size + 4;
    }
    
    return total;
}

uintptr_t get_rr_serialized_size(uint16_t count, struct DnsResourceRecord *rrlist) {
    uintptr_t total = 0;

    for (uint16_t i = 0; i < count; i++) {
        total += rrlist[i].name.size + 10;
        total += rrlist[i].rdlength;
    }

    return total;
}