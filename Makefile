
<<<<<<< HEAD
export SDK_HEADER_ARGS = -I${CURDIR}/modns-sdk/headers  
export SDK_LINK_ARGS = -u_init_modns_sdk -L${CURDIR}/target/debug -lmodns_sdk

all: sdk server plugins
=======
all: sdk server plugins cli
>>>>>>> main

.PHONY: server
server:
	cargo build

.PHONY: debug
debug: export CFLAGS+= -DDEBUG

.PHONY: sdk
sdk: $(wildcard $(CURDIR)/modns-sdk/src/*)
	cargo build -p modns-sdk

.PHONY: cli
cli: $(wildcard $(CURDIR)/cli/src/*)
	cargo build -p modns

.PHONY: plugins
plugins: sdk
	$(MAKE) -C plugins/base_listener/
	$(MAKE) -C plugins/base_resolver/
	$(MAKE) -C plugins/cache/

.PHONY: test-plugins
test-plugins: sdk
	$(MAKE) -C server/tests/test-plugin/

.PHONY: test
test: sdk plugins test-plugins
	cargo test

.PHONY: clean
clean: cargo-clean plugin-clean

cargo-clean:
	cargo clean

plugin-clean:
	$(MAKE) -C plugins/base_listener/ clean
	$(MAKE) -C plugins/base_resolver/ clean
	$(MAKE) -C plugins/cache/ clean
