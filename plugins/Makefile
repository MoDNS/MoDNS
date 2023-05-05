
all: listener resolver cache data demo

.PHONY: listener resolver cache data demo install

listener:
	$(MAKE) -C base-listener/

resolver:
	$(MAKE) -C base-resolver/

cache:
	$(MAKE) -C base-cache/

data:
	$(MAKE) -C base-datacollector/

demo:
	$(MAKE) -C demo-validator/

install: listener resolver cache
	$(MAKE) -C base-listener/ install
	$(MAKE) -C base-resolver/ install
	$(MAKE) -C base-cache/ install
	$(MAKE) -C demo-validator/ install

clean:
	$(RM) $(wildcard ./*/plugin*.so)
