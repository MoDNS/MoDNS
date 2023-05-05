
#include "modns-sdk.h"
#include <string.h>
#include <stdint.h>
#include <stdbool.h>

bool dup_msg(const DnsMessage *src, DnsMessage *dest);
bool dup_bv(ByteVector src, ByteVector *dest);
bool dup_bpv(BytePtrVector src, BytePtrVector *dest);
bool dup_rr(DnsResourceRecord src, DnsResourceRecord *dest);

static char *message_txt = "I hope you're having a good day!";

extern uint8_t impl_validate_resp(const DnsMessage *req, const DnsMessage *resp, DnsMessage *err_resp, const void *plugin_state_ptr) {

    if (!dup_msg(resp, err_resp)) {
        modns_log_cstr(0, "Failed to duplicate message");
        return 0;
    }

    modns_log_cstr(3, "Injecting txt record");
    uintptr_t additional_size = err_resp->additional.size;
    if (!resize_rr_field(&err_resp->additional, additional_size + 1)) {
        modns_log_cstr(0, "Failed to add additional record");
        return 0;
    }

    modns_log_cstr(3, "Added a new blank record");

    DnsResourceRecord *kind_message = err_resp->additional.ptr + additional_size;
    kind_message->type_code = 16;
    kind_message->class_code = 1;
    kind_message->ttl = 0;
    kind_message->rdlength = strlen(message_txt) + 1;
    kind_message->rdata.tag = Txt;
    modns_log_cstr(3, "Updated headers");

    modns_log_cstr(3, "Resizing BytePtrVector");

    kind_message->rdata.txt.txt_data.ptr = NULL;
    kind_message->rdata.txt.txt_data.size = 0;
    kind_message->rdata.txt.txt_data.capacity = 0;

    if (!resize_byteptrvec(&kind_message->rdata.txt.txt_data, 1)) {
        modns_log_cstr(0, "Failed to resize TXT data field");
        return 0;
    }


    modns_log_cstr(3, "Inserting text");
    kind_message->rdata.txt.txt_data.ptr[0] = modns_alloc_bytevec(strlen(message_txt));
    modns_strdup_to_bytevec(message_txt, kind_message->rdata.txt.txt_data.ptr);
    modns_log_cstr(3, "Done!");

    return 1;

}

bool dup_msg(const DnsMessage *src, DnsMessage *dest) {

    modns_log_cstr(3, "Duplicating message");
    // Copy header data
    dest->id = src->id;
    dest->is_response = src->is_response;
    dest->opcode = src->opcode;
    dest->authoritative_answer = src->authoritative_answer;
    dest->truncation = src->truncation;
    dest->recursion_desired = src->recursion_desired;
    dest->recursion_available = src->recursion_available;
    dest->response_code = src->response_code;

    // Copy questions
    if (!resize_question_field(&dest->questions, src->questions.size)) {
        modns_log_cstr(0, "Failed to resize the question field");
        return false;
    }

    for(uintptr_t i = 0; i < src->questions.size; i++) {
        if (!dup_bpv(src->questions.ptr[i].name, &dest->questions.ptr[i].name)) {
            modns_log_cstr(0, "Failed to duplicate a question");
            return false;
        }
        dest->questions.ptr[i].type_code = src->questions.ptr[i].type_code;
        dest->questions.ptr[i].class_code = src->questions.ptr[i].class_code;
    }

    // Copy answers
    if (!resize_rr_field(&dest->answers, src->answers.size)) {
        modns_log_cstr(0, "Failed to resize answers");
        return false;
    }

    for(uintptr_t i = 0; i< src->answers.size; i++) {
        if (!dup_rr(src->answers.ptr[i], &dest->answers.ptr[i])) {
            modns_log_cstr(0, "Failed to copy an answer record");
            return false;
        }
    }

    // Copy authorities
    if (!resize_rr_field(&dest->authorities, src->authorities.size)) {
        modns_log_cstr(0, "Failed to resize authorities");
        return false;
    }

    for(uintptr_t i = 0; i< src->authorities.size; i++) {
        if (!dup_rr(src->authorities.ptr[i], &dest->authorities.ptr[i])) {
            modns_log_cstr(0, "Failed to copy an authority record");
            return false;
        }
    }

    // Copy additional
    if (!resize_rr_field(&dest->additional, src->additional.size)) {
        modns_log_cstr(0, "Failed to resize additional records");
        return false;
    }

    for(uintptr_t i = 0; i< src->additional.size; i++) {
        if (!dup_rr(src->additional.ptr[i], &dest->additional.ptr[i])) {
            modns_log_cstr(0, "Failed to copy an additional record");
            return false;
        }
    }

    return true;
}

bool dup_bv(ByteVector src, ByteVector *dest) {

    if (!resize_bytevec(dest, src.size)) {
        modns_log_cstr(0, "Failed to extend a ByteVector");
        return false;
    }

    memcpy(dest->ptr, src.ptr, src.size);

    return true;
}

bool dup_bpv(BytePtrVector src, BytePtrVector *dest) {

    if (!resize_byteptrvec(dest, src.size)) {
        modns_log_cstr(0, "Failed to extend a BytePtrVector");
        return false;
    }

    for (uintptr_t i = 0; i < src.size; i++) {
        if (!dup_bv(src.ptr[i], &dest->ptr[i])) {
            modns_log_cstr(0, "Failed to copy the contents of a BytePtrVector");
            return false;
        }
    }

    return true;
}

bool dup_rr(DnsResourceRecord src, DnsResourceRecord *dest) {
    if (!dup_bpv(src.name, &dest->name)) {
        modns_log_cstr(0, "Failed to duplicate the name of a Resource Record");
        return false;
    }

    dest->type_code = src.type_code;
    dest->class_code = src.class_code;
    dest->ttl = src.ttl;
    dest->rdlength = src.rdlength;

    dest->rdata.tag = src.rdata.tag;
    switch (src.rdata.tag) {
        case Ns:
            if (!dup_bpv(src.rdata.ns.nsdname, &dest->rdata.ns.nsdname)) {
                modns_log_cstr(0, "Failed to copy an NS rdata record");
                return false;
            }
            break;
        case Cname:
            if (!dup_bpv(src.rdata.cname.cname, &dest->rdata.cname.cname)) {
                modns_log_cstr(0, "Failed to copy a CNAME rdata record");
                return false;
            }
            break;
        case Ptr:
            if (!dup_bpv(src.rdata.ptr.ptrdname, &dest->rdata.ptr.ptrdname)) {
                modns_log_cstr(0, "Failed to copy a PTR rdata record");
                return false;
            }
            break;
        case Soa:
            if (!dup_bpv(src.rdata.soa.mname, &dest->rdata.soa.mname)) {
                modns_log_cstr(0, "Failed to copy a SOA rdata record");
                return false;
            }
            if (!dup_bpv(src.rdata.soa.rname, &dest->rdata.soa.rname)) {
                modns_log_cstr(0, "Failed to copy a SOA rdata record");
                return false;
            }

            dest->rdata.soa.serial = src.rdata.soa.serial;
            dest->rdata.soa.refresh = src.rdata.soa.refresh;
            dest->rdata.soa.retry = src.rdata.soa.retry;
            dest->rdata.soa.expire = src.rdata.soa.expire;
            dest->rdata.soa.minimum = src.rdata.soa.minimum;
            break;
        case Txt:
            if (!dup_bpv(src.rdata.txt.txt_data, &dest->rdata.txt.txt_data)) {
                modns_log_cstr(0, "Failed to copy a TXT rdata record");
                return false;
            }
            break;

        // a and aaaa can be shallow copied
        default:
            dest->rdata = src.rdata;
            break;
    }

    return true;

}

