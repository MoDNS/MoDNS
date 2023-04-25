#include <arpa/inet.h>
#include <stdio.h>
#include "plugin-common.h"

uintptr_t encode_question(struct DnsQuestion question, struct ByteVector resp_buf, uintptr_t initial_offset);
uintptr_t encode_rr(struct DnsResourceRecord rr, struct ByteVector resp_buf, uintptr_t initial_offset);
uintptr_t encode_label_list(struct BytePtrVector list, struct ByteVector resp_buf, uintptr_t initial_offset);
uintptr_t encode_byte_vec(struct ByteVector vec, struct ByteVector resp_buf, uintptr_t initial_offset);
uintptr_t get_encoded_size(struct DnsMessage msg);
uintptr_t get_qd_encoded_size(struct QuestionVector vec);
uintptr_t get_rr_encoded_size(struct RRVector vec);
uintptr_t get_label_list_size(struct BytePtrVector list);

uint8_t encode_bytes(struct DnsMessage msg, struct ByteVector *resp_buf) {

    modns_log(4, 25, "Starting encoder...");
    uintptr_t resp_size = get_encoded_size(msg);
    modns_log(4, 40, "Estimated size of response: %ld", resp_size);

    bool truncation_required = msg.truncation;

    if (resp_size > 512) {
        resp_size = 512;
        truncation_required = true;
    }

    // Header
    *resp_buf = extend_char_vec(*resp_buf, resp_size - resp_buf->size);
    resp_buf->size = resp_size;
    modns_log(4, 55, "Buffer resized to len %ld and capacity %ld", resp_buf->size, resp_buf->capacity);

    *(uint16_t *)(resp_buf->ptr) = htons(msg.id);

    uint8_t bitflags_msb = 0x00;
    if (msg.is_response)             { bitflags_msb |= 0b10000000; }
    if (msg.authoritative_answer)    { bitflags_msb |= 0b00000100; }
    if (truncation_required)                { bitflags_msb |= 0b00000010; }
    if (msg.recursion_desired)       { bitflags_msb |= 0b00000001; }

    bitflags_msb |= (msg.opcode & 0b00001111) << 3;

    resp_buf->ptr[2] = bitflags_msb;

    uint8_t bitflags_lsb = 0x00;
    if (msg.recursion_available)     { bitflags_lsb |= 0b10000000; }
    bitflags_lsb |= msg.response_code & 0b00001111;

    resp_buf->ptr[3] = bitflags_lsb;

    *(uint16_t *)(resp_buf->ptr + 4) = htons(msg.questions.size);
    *(uint16_t *)(resp_buf->ptr + 6) = htons(msg.answers.size);
    *(uint16_t *)(resp_buf->ptr + 8) = htons(msg.authorities.size);
    *(uint16_t *)(resp_buf->ptr + 10) = htons(msg.additional.size);

    uintptr_t cursor = 12;
    modns_log(4, 35, "Successfully encoded header");

    // Questions
    for (uint16_t i = 0; i < msg.questions.size; i++) {
        cursor = encode_question(msg.questions.ptr[i], *resp_buf, cursor);
    }
    modns_log(4, 65, "Successfully encoded %d questions, cursor at %ld", msg.questions.size, cursor);


    // Answers
    for (uint16_t i = 0; i < msg.answers.size; i++) {
        cursor = encode_rr(msg.answers.ptr[i], *resp_buf, cursor);
    }
    modns_log(4, 65, "Successfully encoded %d answers, cursor at %ld", msg.answers.size, cursor);

    // Authorities
    for (uint16_t i = 0; i < msg.authorities.size; i++) {
        cursor = encode_rr(msg.authorities.ptr[i], *resp_buf, cursor);
    }
    modns_log(4, 65, "Successfully encoded %d authorities, cursor at %ld", msg.authorities.size, cursor);

    // Additional
    for (uint16_t i = 0; i < msg.additional.size; i++) {
        cursor = encode_rr(msg.additional.ptr[i], *resp_buf, cursor);
    }
    modns_log(4, 75, "Successfully encoded %d additional entries, cursor at %ld", msg.additional.size, cursor);

    if (cursor > resp_buf->capacity) {
        return 0;
    }

    return 0;
}

uintptr_t encode_question(struct DnsQuestion question, struct ByteVector resp_buf, uintptr_t initial_offset) {
    uintptr_t cursor = initial_offset;

    cursor = encode_label_list(question.name, resp_buf, cursor);

    *(uint16_t *)(resp_buf.ptr + cursor) = htons(question.type_code);
    cursor += 2;

    *(uint16_t *)(resp_buf.ptr + cursor) = htons(question.class_code);
    cursor += 2;

    return cursor;
}

uintptr_t encode_rr(struct DnsResourceRecord rr, struct ByteVector resp_buf, uintptr_t initial_offset) {
    uintptr_t cursor = initial_offset;

    modns_log(4, 35, "Encoding resource record header");
    cursor = encode_label_list(rr.name, resp_buf, cursor);

    *(uint16_t *)(resp_buf.ptr + cursor) = htons(rr.type_code);
    cursor += 2;

    *(uint16_t *)(resp_buf.ptr + cursor) = htons(rr.class_code);
    cursor += 2;

    *(uint32_t *)(resp_buf.ptr + cursor) = htonl(rr.ttl);
    cursor += 4;

    *(uint16_t *)(resp_buf.ptr + cursor) = htons(rr.rdlength);
    cursor += 2;

    modns_log(4, 35, "Encoding resource record rdata");

    // RDATA encoding
    switch (rr.rdata.tag) {
        case A:
            resp_buf.ptr[cursor++] = rr.rdata.a.address[3];
            resp_buf.ptr[cursor++] = rr.rdata.a.address[2];
            resp_buf.ptr[cursor++] = rr.rdata.a.address[1];
            resp_buf.ptr[cursor++] = rr.rdata.a.address[0];
            break;
        case AAAA:
            for (uint8_t i = 15; i >= 0; i--)
                resp_buf.ptr[cursor++] = rr.rdata.aaaa.address[i];
            break;
        case Ns:
            cursor = encode_label_list(rr.rdata.ns.nsdname, resp_buf, cursor);
            break;
        case Cname:
            cursor = encode_label_list(rr.rdata.cname.cname, resp_buf, cursor);
            break;
        case Ptr:
            cursor = encode_label_list(rr.rdata.ptr.ptrdname, resp_buf, cursor);
            break;
        case Soa:
            cursor = encode_label_list(rr.rdata.soa.mname, resp_buf, cursor);
            cursor = encode_label_list(rr.rdata.soa.rname, resp_buf, cursor);
            *(uint32_t *)(resp_buf.ptr + cursor) = htonl(rr.rdata.soa.serial); 
            cursor += 4;
            *(uint32_t *)(resp_buf.ptr + cursor) = htonl(rr.rdata.soa.refresh); 
            cursor += 4;
            *(uint32_t *)(resp_buf.ptr + cursor) = htonl(rr.rdata.soa.retry); 
            cursor += 4;
            *(uint32_t *)(resp_buf.ptr + cursor) = htonl(rr.rdata.soa.expire); 
            cursor += 4;
            *(uint32_t *)(resp_buf.ptr + cursor) = htonl(rr.rdata.soa.minimum); 
            cursor += 4;
            break;
        case Txt:
            cursor = encode_label_list(rr.rdata.txt.txt_data, resp_buf, cursor);
            break;
        case Other:
            cursor = encode_byte_vec(rr.rdata.other.rdata, resp_buf, cursor);
            break;
        default:
            return 0;

    }

    return cursor;
}

uintptr_t encode_label_list(struct BytePtrVector list, struct ByteVector resp_buf, uintptr_t initial_offset) {
    uintptr_t cursor = initial_offset;

    modns_log(4, 65, "Encoding label list of size %ld, cursor at %ld", list.size, cursor);
    
    for (uintptr_t i = 0; i < list.size; i++) {
        resp_buf.ptr[cursor++] = list.ptr[i].size;

        modns_log(4, 60, "Encoding label of size %ld, cursor at %ld", list.ptr[i].size, cursor);

        cursor = encode_byte_vec(list.ptr[i], resp_buf, cursor);
    }

    resp_buf.ptr[cursor++] = 0;

    return cursor;
}

uintptr_t encode_byte_vec(struct ByteVector vec, struct ByteVector resp_buf, uintptr_t initial_offset) {
    uintptr_t cursor = initial_offset;

    for (int i = 0; i < vec.size; i++) {
        resp_buf.ptr[cursor++] = vec.ptr[i];
    }

    return cursor;
}

uintptr_t get_encoded_size(struct DnsMessage msg) {
    uintptr_t total = 12; // Header length

    total += get_qd_encoded_size(msg.questions);

    total += get_rr_encoded_size(msg.answers);

    total += get_rr_encoded_size(msg.authorities);

    total += get_rr_encoded_size(msg.additional);

    return total;
}

uintptr_t get_qd_encoded_size(struct QuestionVector vec) {
    uintptr_t total = 0;
    for (uint16_t i = 0; i < vec.size; i++) {
        total += get_label_list_size(vec.ptr[i].name) + 4;
    }
    
    return total;
}

uintptr_t get_rr_encoded_size(struct RRVector vec) {
    uintptr_t total = 0;

    for (uint16_t i = 0; i < vec.size; i++) {
        total += get_label_list_size(vec.ptr[i].name) + 10;
        total += vec.ptr[i].rdlength;
    }

    return total;
}

uintptr_t get_label_list_size(struct BytePtrVector list) {
    uintptr_t total = 0;
    for (uintptr_t i = 0; i < list.size; i++) {
        total += list.ptr[i].size + 1; //room for label and length bit
    }
    return ++total; // add one for ending null byte
}
