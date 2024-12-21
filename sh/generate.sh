#!/bin/bash
if [ -e conf/item_tags ]; then
	ls -1 conf/item_tags | while IFS= read -r file; do
		echo "Generating item tags for \"${file}\"..."
		deno run --allow-read --allow-write conf/datagen/tags.js items ${file}
	done
fi
if [ -e conf/block_tags ]; then
	ls -1 conf/block_tags | while IFS= read -r file; do
		echo "Generating block tags for \"${file}\"..."
		deno run --allow-read --allow-write conf/datagen/tags.js block ${file}
	done
fi
exit