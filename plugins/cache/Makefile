
SRC=$(wildcard *.go)

plugin.so: export CGO_CFLAGS = $(SDK_LINK_ARGS) -u_init_modns_sdk -ldl
plugin.so: $(SRC)
	go build -buildmode c-shared -o $@ modns/simple_cache

clean:
	$(RM) plugin.so
