
CFLAGS+= -Wall -Wno-pointer-sign $(SDK_HEADER_ARGS)
LDFLAGS=$(SDK_LINK_ARGS) -I../common
SRC=$(wildcard *.go)

export CGO_ENABLED=1

PLUGINFILE=plugin_$(ARCH).so

all: $(PLUGINFILE)

$(PLUGINFILE): export CGO_CFLAGS=$(CFLAGS)
$(PLUGINFILE): export CGO_LDFLAGS=$(LDFLAGS)
$(PLUGINFILE): $(SRC)
	go build -buildmode c-shared -o $@ modns/simple_cache

install: $(PLUGINFILE) manifest.yaml
	install -D -t $(PKGDIR)/usr/share/modns/default-plugins/base-cache $^

clean:
	$(RM) $(wildcard plugin*.so)
