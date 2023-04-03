
CFLAGS+= -Wall -Wno-pointer-sign -u_init_modns_sdk $(SDK_LINK_ARGS)
LDFLAGS=$(SDK_LINK_ARGS) -I../common
SRC=$(wildcard *.go)

plugin.so: export CGO_CFLAGS=$(CFLAGS)
plugin.so: export CGO_LDFLAGS=$(LDFLAGS)
plugin.so: $(SRC)
	go build -buildmode c-shared -o $@ modns/simple_cache

clean:
	$(RM) plugin.so
