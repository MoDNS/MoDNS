CFLAGS=-Wall
LDFLAGS=$(SDK_LINK_ARGS) -I../common

all: plugin.so

plugin.so: $(wildcard ../common/*.c) $(wildcard src/*.c)
	$(CC) $(CFLAGS) -fPIC -shared $^ -o $@ $(LDFLAGS)
