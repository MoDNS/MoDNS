#include "plugin-common.h"
#include <stdio.h>
#include <stdarg.h>

void modns_log(uint8_t log_level, uintptr_t buf_size, char *format, ...) {
    
    va_list vararg;
    va_start(vararg, format);

    char *buf = malloc(buf_size);
    vsnprintf(buf, buf_size, format, vararg);

    va_end(vararg);

    modns_log_cstr(log_level, buf);

    free(buf);
}
