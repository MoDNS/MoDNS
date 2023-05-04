package main

/*
#include "modns-sdk.h"
#include <stdlib.h>

typedef const struct DnsMessage constMessage;
typedef const void constVoid;

*/
import "C"
import(
    "unsafe"
    "fmt"
    "database/sql"
    _ "github.com/mattn/go-sqlite3"
    _ "github.com/lib/pq"
)

func main() {}

var db *sql.DB

//export impl_inspect_resp
func impl_inspect_resp(req *C.constMessage, resp *C.constMessage, source C.uchar, state *C.constVoid) C.uchar {

    if uint8(source) != 1 { // Only cache responses from the resolver
        return 0
    }

    answers := unsafe.Slice(resp.answers.ptr, resp.answers.size)

    for _, answer := range answers {
        hostname := decode_hostname(answer.name)

        _, err := db.Exec(`INSERT INTO basecache (host, rrtype, tag, rdata, ttl, origin)
            VALUES (?1, ?2, ?3, ?4, ?5, unixepoch())
            ON CONFLICT (host, rrtype) DO UPDATE SET (tag, rdata, ttl, origin) = (?3, ?4, ?5, unixepoch())`,
            hostname, answer.type_code, answer.rdata.tag, answer.rdata.anon0[:], answer.ttl)

        if err != nil {
            modns_log(1, fmt.Sprint("Encountered error entering cache record into database: ", err))
            return 0
        }
    }

    return 0
}

//export impl_intercept_req
func impl_intercept_req(req *C.constMessage, resp *C.DnsMessage, plugin_state *C.constVoid) C.uchar {

    return 0
}

//export impl_plugin_setup
func impl_plugin_setup() *C.void {
    modns_log(3, "Retrieving database connection info")
    database := C.modns_get_database()

    if database == nil {
        modns_log(0, "Couldn't retrieve database connection info from server")
        return nil
    }

    modns_log(3, "Connecting to database")
    if database.tag == C.SQLite{
        db = sqlite_connect(*database)
    } else {
        db = postgres_connect(*database)
    }

    modns_log(3, "Checking connection to database")
    if err := db.Ping(); err != nil {
        modns_log(0, fmt.Sprint("Connection to database could not be established", err))
    }

    modns_log(3, "Creating database table")
    _, err := db.Exec(`CREATE TABLE IF NOT EXISTS basecache (
        host    VARCHAR(255),
        rrtype  UNSIGNED INTEGER NOT NULL,
        tag     UNSIGNED INTEGER NOT NULL,
        rdata   BLOB,
        ttl     UNSIGNED INTEGER NOT NULL,
        origin  UNSIGNED INTEGER NOT NULL,

        PRIMARY KEY(host, rrtype)
        )`)

    if err != nil {
        modns_log(0, fmt.Sprint("Error creating database table:", err))
    }

    modns_log(2, "Successfully initialized cache database")
    return nil
}

func modns_log(level uint8, msg string) {
    msg_cstr := C.CString(msg)
    defer C.free(unsafe.Pointer(msg_cstr))

    C.modns_log_cstr(C.uchar(level), msg_cstr)
}

func into_go_string(src C.struct_ByteVector) string {

    ptr := unsafe.Pointer(src.ptr)

    return C.GoStringN((*C.char)(ptr), C.int(src.size))
}

func sqlite_connect(dbinfo C.struct_DatabaseInfo) *sql.DB {
    if dbinfo.tag != C.SQLite {
        return nil
    }

    sqlite_info := *(*C.struct_SQLite_Body)(unsafe.Pointer(&dbinfo.anon0[0]))

    sqlite_path := into_go_string(sqlite_info.file)

    conn, err := sql.Open("sqlite3", sqlite_path)

    if err != nil {
        modns_log(0, fmt.Sprintf("Error connecting to SQLite database: %s", err))
        return nil
    }

    return conn
}

func postgres_connect(dbinfo C.struct_DatabaseInfo) *sql.DB {
    if dbinfo.tag != C.Postgres {
        return nil
    }

    postgres_info := *(*C.struct_Postgres_Body)(unsafe.Pointer(&dbinfo.anon0[0]))
    postgres_addr := into_go_string(postgres_info.host)
    postgres_port := uint16(postgres_info.port)
    postgres_user := into_go_string(postgres_info.username)
    postgres_pass := into_go_string(postgres_info.password)

    connStr := fmt.Sprintf("postgresql://%s:%s@%s:%d/basecache", postgres_user, postgres_pass, postgres_addr, postgres_port)

    modns_log(3, fmt.Sprint("Connecting to database ", connStr))

    conn, err := sql.Open("postgres", connStr)

    if err != nil {
        modns_log(0, fmt.Sprint("Postgres connection failed: ", err))
        return nil
    }

    return conn
}

func decode_hostname(vec C.struct_BytePtrVector) string {
    v := unsafe.Slice(vec.ptr, vec.size)

    name := ""
    for _, s := range v {
        name = name + "." + into_go_string(s)
    }

    return name[1:]
}
