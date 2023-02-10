
all: cargo base-plugin

cargo:
	cargo build

base-plugin:
	$(MAKE) -C plugins/base/