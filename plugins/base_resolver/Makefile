
all: plugin.so

plugin.so: $(wildcard src/*)
	$(CC) $(CFLAGS) -fPIC -shared $^ -o $@