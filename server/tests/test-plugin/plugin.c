#include "modns-sdk.h"

#include <stdint.h>

uint8_t impl_intercept_req(const struct DnsMessage *req, struct DnsMessage *resp, void *state) {
	modns_log_info_ptr("interceptor called", 19);

	return 0;
}

uint8_t impl_validate_resp(const struct DnsMessage *req, const struct DnsMessage *resp, struct DnsMessage *err_resp, void *state) {
	modns_log_info_ptr("validator called", 17);

	return 0;
}

uint8_t impl_inspect_resp(const struct DnsMessage *req, const struct DnsMessage *resp, uint8_t src, void *state) {
	modns_log_info_ptr("inspector called", 17);

	return 0;
}
