
all: sdk server plugins

.PHONY: server
server:
	cargo build

.PHONY: debug
debug: export CFLAGS+= -DDEBUG

.PHONY: sdk
sdk: $(wildcard $(CURDIR)/modns-sdk/src/*)
	cargo build -p modns-sdk

.PHONY: plugins
export SDK_LINK_ARGS = -I${CURDIR}/modns-sdk/headers -L${CURDIR}/target/debug -lmodns_sdk
plugins: sdk
	$(MAKE) -C plugins/base_listener/
	$(MAKE) -C plugins/base_resolver/

.PHONY: test
test: all
	cargo test

.PHONY: clean
clean: cargo-clean plugin-clean

cargo-clean:
	cargo clean

plugin-clean:
	$(MAKE) -C plugins/base_listener/ clean
	$(MAKE) -C plugins/base_resolver/ clean
