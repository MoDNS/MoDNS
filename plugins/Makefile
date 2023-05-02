
all: listener resolver cache data

.PHONY: listener resolver cache data install

listener:
	$(MAKE) -C base-listener/

resolver:
	$(MAKE) -C base-resolver/

cache:
	$(MAKE) -C base-cache/

data:
	$(MAKE) -C base-datacollector/

install: listener resolver cache
	$(MAKE) -C base-listener/ install
	$(MAKE) -C base-resolver/ install
	$(MAKE) -C base-cache/ install

clean:
	$(RM) $(wildcard ./*/plugin*.so)
