
CFLAGS+= -Wall -Wno-pointer-sign $(SDK_HEADER_ARGS)
LDFLAGS=$(SDK_LINK_ARGS) -I../common

PLUGINFILE=plugin_$(ARCH).so

all: $(PLUGINFILE)

$(PLUGINFILE): $(wildcard ../common/*.c) $(wildcard src/*.c) | $(wildcard ../common/*.h) $(wildcard ../modns-sdk/headers/*.h)
	$(CC) $(CFLAGS) -fPIC -shared $^ -o $@ $(LDFLAGS)

install: $(PLUGINFILE) manifest.yaml
	install -D -t $(PKGDIR)/usr/share/modns/default-plugins/base-listener $^

clean:
	$(RM) $(wildcard plugin*.so)
