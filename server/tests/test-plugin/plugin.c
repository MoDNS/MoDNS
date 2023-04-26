#include "modns-sdk.h"

#include <stdint.h>

uint8_t impl_intercept_req(const struct DnsMessage *req, struct DnsMessage *resp, const void *state) {
	modns_log_cstr(2, "interceptor called");

	return 0;
}

uint8_t impl_validate_resp(const struct DnsMessage *req, const struct DnsMessage *resp, struct DnsMessage *err_resp, const void *state) {
	modns_log_cstr(2, "validator called");

	return 0;
}

uint8_t impl_inspect_resp(const struct DnsMessage *req, const struct DnsMessage *resp, uint8_t src, const void *state) {
	modns_log_cstr(2, "inspector called");

	return 0;
}
