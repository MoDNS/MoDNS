#include<arpa/inet.h>
#include <stdio.h>
#include "plugin-common.h"

uintptr_t decode_question(struct ByteVector req, uintptr_t initial_offset, struct DnsQuestion *question);
uintptr_t decode_rr(struct ByteVector req, uintptr_t initial_offset, struct DnsResourceRecord *rr);
uintptr_t decode_label_list(struct ByteVector req, uintptr_t initial_offset, struct BytePtrVector *vec);

uint8_t decode_bytes(struct ByteVector req, struct DnsMessage *message) {

    if (req.size < 12) {return 1;} // Message must be at least 12 bytes long to fit header

    uint16_t req_id = ntohs(*(uint16_t *)req.ptr);

    // Decode header flags
    bool qr = req.ptr[2] & 0b10000000;
    bool aa = req.ptr[2] & 0b00000100;
    bool tc = req.ptr[2] & 0b00000010;
    bool rd = req.ptr[2] & 0b00000001;
    bool ra = req.ptr[3] & 0b10000000;

    // reserved bits must be 0
    if (req.ptr[3] & 0b01110000) {return 1;}

    // Decode the opcode
    uint8_t opcode_char = (req.ptr[2] & 0b01111000) >> 3;

    enum DnsOpcode opcode;

    switch (opcode_char) {
        case 0:
            opcode = Query;
            break;
        case 1:
            opcode = InverseQuery;
            break;
        case 2:
            opcode = Status;
            break;
        case 4:
            opcode = Notify;
            break;
        case 5:
            opcode = Update;
            break;
        case 6:
            opcode = DSO;
            break;
        default:
            return 1;
    }

    // Decode the response code
    uint8_t rcode_char = (req.ptr[3] & 0b00001111);

    enum DnsResponseCode rcode;

    switch (rcode_char) {
        case 0:
            rcode = NoError;
            break;
        case 1:
            rcode = FormatError;
            break;
        case 2:
            rcode = ServerFailure;
            break;
        case 3:
            rcode = NameError;
            break;
        case 4:
            rcode = NotImplemented;
            break;
        case 5:
            rcode = Refused;
            break;
        default:
            return 1;
    }

    // Update header struct fields
    message->header.id = req_id;
    message->header.is_response = qr;
    message->header.authoritative_answer = aa;
    message->header.truncation = tc;
    message->header.recursion_desired = rd;
    message->header.recursion_available = ra;
    message->header.opcode = opcode;
    message->header.response_code = rcode;

    // Get the number of each field from the header
    uint16_t qdcount = ntohs(*(uint16_t *)(req.ptr + 4));
    uint16_t ancount = ntohs(*(uint16_t *)(req.ptr + 6));
    uint16_t nscount = ntohs(*(uint16_t *)(req.ptr + 8));
    uint16_t arcount = ntohs(*(uint16_t *)(req.ptr + 10));

    if (qdcount > 0) { resize_field(message, qdcount, Query);}
    if (ancount > 0) { resize_field(message, ancount, Answer);}
    if (nscount > 0) { resize_field(message, nscount, Authority);}
    if (arcount > 0) { resize_field(message, arcount, Additional);}

    uintptr_t cursor = 12; // Start a cursor at the end of the header

    for (uint16_t question_num = 0; question_num < qdcount; question_num++) {

        printf("Decoding question %d, cursor at %ld\n", question_num, cursor);
        cursor = decode_question(req, cursor, message->question + question_num);
        printf("Decoded, cursor at %ld\n", cursor);
        if (cursor == 0) {return 1;}
    }

    printf("Cursor position: %ld, vector size: %ld\n", cursor, req.size);

    return 0;
}

uintptr_t decode_question(struct ByteVector req, uintptr_t initial_offset, struct DnsQuestion *question) {
    uintptr_t cursor = initial_offset;

    cursor = decode_label_list(req, cursor, &(question->name));
    if (cursor == 0) {return 0;}

    if (req.size > cursor + 4) {return 0;}

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

    return cursor;
}

uintptr_t decode_label_list(struct ByteVector req, uintptr_t initial_offset, struct BytePtrVector *vec) {
    uintptr_t cursor = initial_offset;

    uint8_t label_len = req.ptr[cursor++];
    struct BytePtrVector qname = {NULL, 0, 0};
    for (uint8_t label_num = 0; label_len > 0; label_num++) {
        
        if (req.size < cursor + label_len) {return 0;}

        qname = extend_ptr_vec(qname, 1);

        struct ByteVector label = {NULL, 0, 0};
        label = extend_char_vec(label, label_len + 1);

        label.size = snprintf(label.ptr, label_len + 1, "%s", req.ptr + cursor);

        cursor += label_len;

        qname.ptr[label_num] = label;
        qname.size++;

        label_len = req.ptr[cursor++];
        printf("Decoded %s, cursor at %ld, next label has length %d\n", label.ptr, cursor, label_len);
    };

    *vec = qname;

    return cursor;
}