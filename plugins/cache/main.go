package main

/*
#include "modns-sdk.h"
#include <stdlib.h>

typedef const struct DnsMessage bruh;
*/
import "C"
import "unsafe"

func main() {}

func log(level uint8, msg string) {
    msg_cstr := C.CString(msg)

    C.modns_log(C.uchar(level), msg_cstr)

    C.free(unsafe.Pointer(msg_cstr))
}

//export impl_inspect_resp
func impl_inspect_resp(req *C.bruh, resp *C.bruh, source C.uchar, state unsafe.Pointer) C.uchar {

    log(2, "Inspector called")

    return 0
}
