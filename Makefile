
all: sdk server plugins

.PHONY: server
server:
	cargo build

.PHONY: sdk
sdk: $(wildcard $(CURDIR)/modns-sdk/src/*)
	cargo build -p modns-sdk

.PHONY: plugins
export SDK_LINK_ARGS = -I${CURDIR}/modns-sdk/headers -L${CURDIR}/target/debug -lmodns_sdk
plugins: sdk
	$(MAKE) -C plugins/base_listener/
	$(MAKE) -C plugins/base_resolver/

test: all
	cargo test -- --nocapture