CFLAGS+= -Wall -Wno-pointer-sign $(SDK_HEADER_ARGS)
LDFLAGS=$(SDK_LINK_ARGS)

all: plugin.so

plugin.so: plugin.c
	$(CC) $(CFLAGS) -fPIC -shared $^ -o $@ $(LDFLAGS)

clean:
	$(RM) plugin.so
