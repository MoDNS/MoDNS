
CFLAGS+= -Wall -Wno-pointer-sign $(SDK_HEADER_ARGS)
LDFLAGS=$(SDK_LINK_ARGS) -I../common

PLUGINFILE=plugin_$(ARCH).so

all: $(PLUGINFILE)

$(PLUGINFILE): $(wildcard *.c)
	$(CC) $(CFLAGS) -fPIC -shared $^ -o $@ $(LDFLAGS)

install: $(PLUGINFILE) manifest.yaml
	install -D -t $(PKGDIR)/usr/share/modns/default-plugins/demo-validator $^

clean:
	$(RM) $(wildcard plugin*.so)
