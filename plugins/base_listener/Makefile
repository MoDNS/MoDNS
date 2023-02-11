
all: plugin.so

plugin.so: $(wildcard src/*)
	$(CC) $(CFLAGS) -I$(SDK_HEADER_DIR) -fPIC -shared $^ -o $@