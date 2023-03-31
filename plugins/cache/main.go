package main

/*
#include "modns-sdk.h"
#include <stdlib.h>
*/
import "C"
import "unsafe"

func main() {}

func log(level int8, msg string) {
    msg_cstr := C.CString(msg)
    msg_len := C.ulong(len(msg)) + 1
    switch level {
    case 0:
	C.modns_log_error_ptr(msg_cstr, msg_len)
    case 1:
	C.modns_log_warn_ptr(msg_cstr, msg_len)
    case 2:
	C.modns_log_info_ptr(msg_cstr, msg_len)
    case 3:
	C.modns_log_debug_ptr(msg_cstr, msg_len)
    default:
	C.modns_log_trace_ptr(msg_cstr, msg_len)
    }

    C.free(unsafe.Pointer(&msg_cstr))
}
