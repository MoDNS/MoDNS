
all: server-bin plugin-bins

server-bin:
	cargo build

export SDK_HEADER_DIR = ${CURDIR}/modns-sdk/headers
plugin-bins:
	$(MAKE) -C plugins/base_listener/
	$(MAKE) -C plugins/base_resolver/

test: all
	cargo test -- --nocapture