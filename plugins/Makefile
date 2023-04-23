
all: listener resolver cache

.PHONY: listener resolver cache install

listener:
	$(MAKE) -C base-listener/

resolver:
	$(MAKE) -C base-resolver/

cache:
	$(MAKE) -C base-cache/

install: listener resolver cache
	$(MAKE) -C base-listener/ install
	$(MAKE) -C base-resolver/ install
	$(MAKE) -C base-cache/ install

clean:
	$(RM) $(wildcard ./*/plugin*.so)
