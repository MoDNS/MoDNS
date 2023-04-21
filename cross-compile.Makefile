
# Overrides for specific architectures
ifeq ($(ARCH),x86_64)
GOARCH=amd64
endif

ifeq ($(ARCH),aarch64)
GOARCH=arm64
endif

ifeq ($(ARCH),arm)
TOOLCHAIN=gnueabi
endif

TOOLCHAIN?=gnu
PROFILE?=debug
CARGO_BUILD_TARGET?=$(ARCH)-unknown-linux-$(TOOLCHAIN)
CC=$(ARCH)-linux-$(TOOLCHAIN)-gcc
GOARCH?=$(ARCH)

export ARCH TOOLCHAIN TARGET CARGO_BUILD_TARGET CC GOARCH
