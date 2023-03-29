CFLAGS+= -Wall -Wno-pointer-sign -u_init_modns_sdk
LDFLAGS=$(SDK_LINK_ARGS)

all: plugin.so

plugin.so: plugin.c
	$(CC) $(CFLAGS) -fPIC -shared $^ -o $@ $(LDFLAGS)

clean:
	$(RM) plugin.so
