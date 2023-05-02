
# Include variable definitions for cross-compiling
ifdef ARCH
include cross-compile.Makefile
else
export ARCH=$(shell uname -m)
endif

PROFILE?=debug

HEADER_DIR=$(CURDIR)/modns-sdk/headers
TARGET_DIR=$(CURDIR)/target/$(or $(CARGO_BUILD_TARGET),.)/$(PROFILE)

ifdef MODNS_INSTALL_PKGDIR
PKGDIR=$(CURDIR)/$(MODNS_INSTALL_PKGDIR)
export PKGDIR
endif

export SDK_HEADER_ARGS=-I$(HEADER_DIR)
export SDK_LINK_ARGS=-u_init_modns_sdk -L$(TARGET_DIR) -lmodns_sdk -ldl
export CFLAGS+=-fdiagnostics-color=always

all: sdk server plugins cli

.PHONY: server
server:
	cargo build

.PHONY: debug
debug: export CFLAGS+=-DDEBUG

.PHONY: sdk
sdk: $(wildcard $(CURDIR)/modns-sdk/src/*)
	cargo build -p modns-sdk

.PHONY: cli
cli: $(wildcard $(CURDIR)/cli/src/*)
	cargo build -p modns

.PHONY: plugins
plugins: sdk
	$(MAKE) -C plugins/base-listener/
	$(MAKE) -C plugins/base-resolver/
	$(MAKE) -C plugins/base-cache/

.PHONY: test-plugins
test-plugins: sdk
	$(MAKE) -C server/tests/test-plugin/

# We can't actually run tests when cross compiling
ifeq ($(ARCH),$(shell uname -m))
.PHONY: test
test: plugins test-plugins
	cargo test
endif

.PHONY: clean
clean: cargo-clean plugin-clean
	$(MAKE) -C plugins/ clean
	cargo clean

install:
	install -d $(PKGDIR)/usr/share/modns/web $(PKGDIR)/var/lib/modns
	install -CDt $(PKGDIR)/usr/bin $(TARGET_DIR)/modns $(TARGET_DIR)/modnsd
	$(MAKE) -C plugins/ install
