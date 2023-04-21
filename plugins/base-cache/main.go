package main

/*
#include "modns-sdk.h"
#include <stdlib.h>

typedef const struct DnsMessage constMessage;
typedef const void constVoid;
*/
import "C"
import "unsafe"

func main() {}

func log(level uint8, msg string) {
    msg_cstr := C.CString(msg)

    C.modns_log_cstr(C.uchar(level), msg_cstr)

    C.free(unsafe.Pointer(msg_cstr))
}

//export impl_inspect_resp
func impl_inspect_resp(req *C.constMessage, resp *C.constMessage, source C.uchar, state *C.constVoid) C.uchar {

    log(2, "Inspector called")

    return 0
}
