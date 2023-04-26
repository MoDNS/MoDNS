#include<arpa/inet.h>
#include <stdio.h>
#include "plugin-common.h"

uintptr_t decode_question(struct ByteVector req, uintptr_t initial_offset, struct DnsQuestion *question);
uintptr_t decode_rr(struct ByteVector req, uintptr_t initial_offset, struct DnsResourceRecord *rr);
uintptr_t decode_label_list(struct ByteVector req, uintptr_t initial_offset, struct BytePtrVector *vec);

uint8_t decode_bytes(struct ByteVector req, struct DnsMessage *message) {

    if (req.size < 12) {return 1;} // Message must be at least 12 bytes long to fit header

    modns_log(4, 30, "req has size %ld", req.size);

    uint16_t req_id = ntohs(*(uint16_t *)req.ptr);

    // Decode header flags
    bool qr = req.ptr[2] & 0b10000000;
    bool aa = req.ptr[2] & 0b00000100;
    bool tc = req.ptr[2] & 0b00000010;
    bool rd = req.ptr[2] & 0b00000001;
    bool ra = req.ptr[3] & 0b10000000;

    // Decode the opcode
    uint8_t opcode_char = (req.ptr[2] & 0b01111000) >> 3;

    // Decode the response code
    uint8_t rcode_char = (req.ptr[3] & 0b00001111);

    // Update header struct fields
    message->id = req_id;
    message->is_response = qr;
    message->authoritative_answer = aa;
    message->truncation = tc;
    message->recursion_desired = rd;
    message->recursion_available = ra;
    message->opcode = opcode_char;
    message->response_code = rcode_char;

    // Get the number of each field from the header
    uint16_t qdcount = ntohs(*(uint16_t *)(req.ptr + 4));
    uint16_t ancount = ntohs(*(uint16_t *)(req.ptr + 6));
    uint16_t nscount = ntohs(*(uint16_t *)(req.ptr + 8));
    uint16_t arcount = ntohs(*(uint16_t *)(req.ptr + 10));

    if (qdcount > 0) { resize_question_field(&message->questions, qdcount);}
    if (ancount > 0) { resize_rr_field(&message->answers, ancount);}
    if (nscount > 0) { resize_rr_field(&message->authorities, nscount);}
    if (arcount > 0) { resize_rr_field(&message->additional, arcount);}

    uintptr_t cursor = 12; // Start a cursor at the end of the header

    for (uint16_t i = 0; i < qdcount; i++) {

        modns_log(4, 45, "Decoding question %d, cursor at %ld", i, cursor);

        cursor = decode_question(req, cursor, message->questions.ptr + i);

        modns_log(4, 30, "Decoded, cursor at %ld", cursor);

        if (cursor == 0) {return 1;}
    }

    for (uint16_t i = 0; i < ancount; i++) {

        modns_log(4, 45, "Decoding answer %d, cursor at %ld", i, cursor);

        cursor = decode_rr(req, cursor, message->answers.ptr + i);

        modns_log(4, 30, "Decoded, cursor at %ld", cursor);
        if (cursor == 0) {return 1;}
    }

    for (uint16_t i = 0; i < nscount; i++) {

        modns_log(4, 50, "Decoding authority %d, cursor at %ld", i, cursor);

        cursor = decode_rr(req, cursor, message->authorities.ptr + i);

        modns_log(4, 30, "Decoded, cursor at %ld", cursor);

        if (cursor == 0) {return 1;}
    }

    for (uint16_t i = 0; i < arcount; i++) {

        modns_log(4, 45, "Decoding additional %d, cursor at %ld", i, cursor);
        cursor = decode_rr(req, cursor, message->additional.ptr + i);

        modns_log(4, 35, "Decoded, cursor at %ld", cursor);

        if (cursor == 0) {return 1;}
    }

    modns_log(4, 50, "Cursor position: %ld, vector size: %ld", cursor, req.size);

    return 0;
}

uintptr_t decode_question(struct ByteVector req, uintptr_t initial_offset, struct DnsQuestion *question) {
    uintptr_t cursor = initial_offset;

    cursor = decode_label_list(req, cursor, &(question->name));
    if (cursor == 0) {return 0;}

    if (req.size < cursor + 4) {return 0;}

    uint16_t qtype = ntohs(*(uint16_t *)(req.ptr + cursor));
    cursor += 2;

    uint16_t qclass = ntohs(*(uint16_t *)(req.ptr + cursor));
    cursor += 2;

    question->class_code = qclass;
    question->type_code = qtype;

    return cursor;
}

uintptr_t decode_rr(struct ByteVector req, uintptr_t initial_offset, struct DnsResourceRecord *rr) {
    uintptr_t cursor = initial_offset;

    modns_log(4, 40, "decoding labels, cursor at %ld", cursor);

    cursor = decode_label_list(req, cursor, &(rr->name));
    if (cursor == 0) {return 0;}

    if (req.size < cursor + 10) {return 0;}

    modns_log(4, 20, "decoding header");

    rr->type_code = ntohs(*(uint16_t *)(req.ptr + cursor));
    cursor += 2;

    rr->class_code = ntohs(*(uint16_t *)(req.ptr + cursor));
    cursor += 2;

    rr->ttl = ntohl(*(uint32_t *)(req.ptr + cursor));
    cursor += 4;

    rr->rdlength = ntohs(*(uint16_t *)(req.ptr + cursor));
    cursor += 2;

    if (req.size < cursor + rr->rdlength) {return 0;}

    struct ByteVector rdata = {NULL, 0, 0};
    rdata = extend_char_vec(rdata, rr->rdlength);

    modns_log(4, 20, "copying bytes");

    for(uint16_t i = 0; i < rr->rdlength; i++) {
        rdata.ptr[i] = req.ptr[cursor++];
    }

    rdata.size = rr->rdlength;
    rr->rdata.tag = Other;
    rr->rdata.other.rdata = rdata;

    return cursor;
}

uintptr_t decode_label_list(struct ByteVector req, uintptr_t initial_offset, struct BytePtrVector *vec) {
    uintptr_t cursor = initial_offset;


    uint8_t label_len = req.ptr[cursor++];

    modns_log(4, 65, "Starting to decode label list, first label has length %d", label_len);

    struct BytePtrVector qname = *vec;
    for (uint8_t label_num = qname.size; label_len > 0; label_num++) {

        if ((label_len & 0b11000000) == 0b11000000) {
            uint16_t label_offset = ((label_len & 0b00111111) << 8) | req.ptr[cursor++];

            uintptr_t rc = decode_label_list(req, label_offset, &qname);
            if (rc == 0) {return 0;}
            break;
        }
        
        if (req.size < cursor + label_len) { return 0;}

        qname = extend_ptr_vec(qname, 1);

        struct ByteVector label = {NULL, 0, 0};
        label = extend_char_vec(label, label_len + 1);

        snprintf(label.ptr, label_len + 1, "%s", req.ptr + cursor);
        label.size = label_len;

        cursor += label_len;

        qname.ptr[label_num] = label;
        qname.size++;

        label_len = req.ptr[cursor++];

        modns_log(4, 75, "Decoded %s, cursor at %ld, next label has length %d", label.ptr, cursor, label_len);

    };

    *vec = qname;

    return cursor;
}
