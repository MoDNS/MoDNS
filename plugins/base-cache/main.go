package main

/*
#include "modns-sdk.h"
#include <stdlib.h>

typedef const struct DnsMessage constMessage;
typedef const void constVoid;

__attribute__((weak))
struct ByteVector __sqlite_path(struct DatabaseInfo dbinfo) {
    return dbinfo.sq_lite.file;
}
*/
import "C"
import(
    "unsafe"
    "fmt"
    "database/sql"
    _ "github.com/mattn/go-sqlite3"
)

func main() {}

var db *sql.DB

func log(level uint8, msg string) {
    msg_cstr := C.CString(msg)
    defer C.free(unsafe.Pointer(msg_cstr))

    C.modns_log_cstr(C.uchar(level), msg_cstr)
}

func into_go_string(src C.struct_ByteVector) string {

    ptr := unsafe.Pointer(src.ptr)

    return C.GoStringN((*C.char)(ptr), C.int(src.size))
}

//export impl_plugin_setup
func impl_plugin_setup() *C.void {
    database := C.modns_get_database()
    if database.tag != C.SQLite {
        log(1, "Not compatible with Postgres database")
        return nil
    }

    sqlite_path := into_go_string(C.__sqlite_path(*database))

    conn, err := sql.Open("sqlite3", sqlite_path)

    if err != nil {
        log(0, fmt.Sprintf("Error connecting to SQLite database: %s", err))
        return nil
    }

    db = conn

    return nil
}

//export impl_inspect_resp
func impl_inspect_resp(req *C.constMessage, resp *C.constMessage, source C.uchar, state *C.constVoid) C.uchar {

    log(2, "Inspector called")

    return 0
}
