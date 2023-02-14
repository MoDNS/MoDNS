#include <stdio.h>
#include "modns-sdk.h"

uintptr_t decode_question(const uint8_t *req, uintptr_t req_size, struct DnsQuestion *question);

uint8_t impl_deserialize_req(const uint8_t *req, uintptr_t size, struct DnsMessage *message) {

    if (size < 12) {return 1;} // Message must be at least 12 bytes long to fit header

    uint16_t req_id = *(req+1) | (*req << 8);

    // Decode header flags
    bool qr = req[2] & 0b10000000;
    bool aa = req[2] & 0b00000100;
    bool tc = req[2] & 0b00000010;
    bool rd = req[2] & 0b00000001;
    bool ra = req[3] & 0b10000000;

    // reserved bits must be 0
    if (req[3] & 0b01110000) {return 1;}

    // Decode the opcode
    uint8_t opcode_char = (req[2] & 0b01111000) >> 3;

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
    uint8_t rcode_char = (req[3] & 0b00001111);

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
    uint16_t qdcount = *(req+5) | (*(req+4) << 8);
    uint16_t ancount = *(req+7) | (*(req+6) << 8);
    uint16_t nscount = *(req+9) | (*(req+8) << 8);
    uint16_t arcount = *(req+11) | (*(req+10) << 8);

    if (qdcount > 0) { resize_field(message, qdcount, Query);}
    if (ancount > 0) { resize_field(message, ancount, Answer);}
    if (nscount > 0) { resize_field(message, nscount, Authority);}
    if (arcount > 0) { resize_field(message, arcount, Additional);}

    uintptr_t cursor = 12; // Start a cursor at the end of the header

    for (uint16_t question_num = 0; question_num < qdcount; question_num++) {

        uintptr_t len_decoded = decode_question(req + cursor, size - cursor, message->question + question_num);
        if (len_decoded == 0) {return 1;}

        cursor += len_decoded;
    }

    return 0;
}

uintptr_t decode_question(const uint8_t *req, uintptr_t req_size, struct DnsQuestion *question) {
    uintptr_t cursor = 0;

    uint8_t label_len = req[cursor++];
    struct BytePtrVector qname = {NULL, 0, 0};
    for (uint8_t label_num = 0; label_len > 0; label_num++) {
        
        if (req_size < cursor + label_len) {return 0;}

        qname = extend_ptr_vec(qname, 1);

        struct ByteVector label = {NULL, 0, 0};
        label = extend_char_vec(label, label_len + 1);

        label.size = snprintf(label.ptr, label_len + 1, "%s", req + cursor);

        cursor += label_len;

        qname.ptr[label_num] = label;
        qname.size++;

        label_len = req[cursor++];
    };

    if (req_size > cursor + 4) {return 0;}

    uint16_t qtype = *(req+cursor+1) | (*(req+cursor) << 8);
    cursor += 2;

    uint16_t qclass = *(req+cursor+1) | (*(req+cursor) << 8);
    cursor += 2;

    question->name = qname;
    question->class_code = qclass;
    question->type_code = qtype;

    return cursor;
}