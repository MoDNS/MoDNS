#include "plugin-common.h"
#include <stdio.h>
#include <stdarg.h>

void modns_log(uint8_t log_level, uintptr_t buf_size, char *format, ...) {
    
    va_list vararg;
    va_start(vararg, format);

    char *buf = malloc(buf_size);
    uintptr_t len = vsnprintf(buf, buf_size, format, vararg) + 1;
    va_end(vararg);

    switch (log_level) {
        case 0:
            modns_log_error_ptr(buf, len);
            break;
        case 1:
            modns_log_warn_ptr(buf, len);
            break;
        case 2:
            modns_log_info_ptr(buf, len);
            break;
        case 3:
            modns_log_debug_ptr(buf, len);
            break;
        default:
            modns_log_trace_ptr(buf, len);
    }

    free(buf);
}
