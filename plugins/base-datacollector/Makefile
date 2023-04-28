CFLAGS+= -Wall -Wno-pointer-sign $(SDK_HEADER_ARGS)
LDFLAGS=$(SDK_LINK_ARGS) -I../common -ljsoncpp

PLUGINFILE=plugin_$(ARCH).so

all: $(PLUGINFILE)

$(PLUGINFILE): $(wildcard src/*.cpp)
	su -c "apt-get install libjsoncpp-dev -y"
	$(CC) $(CFLAGS) -fPIC -shared $^ -o $@ $(LDFLAGS)

install: $(PLUGINFILE) manifest.yaml
	install -D -t $(PKGDIR)/usr/share/modns/default-plugins/base-listener $^

clean:
	$(RM) $(wildcard plugin*.so)
