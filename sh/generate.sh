#!/bin/bash
echo "Removing previously-generated tags..."
tree -ifld | grep -E "src/.*/data/.*" | while IFS= read -r file; do
	rmdir "${file}" 2>/dev/null
done
tree -ifl | grep -E "src/.*/data/.*/tags/(items|block)/" | grep -E "\.json$" | while IFS= read -r file; do
	rm -v "${file}"
done
if [ -e conf/item_tags ]; then
	ls -1 conf/item_tags | grep -E "\.tsv$" | while IFS= read -r file; do
		echo "Generating item tags for \"${file}\"..."
		deno run --allow-read --allow-write conf/datagen/tags.js items ${file}
	done
fi
if [ -e conf/block_tags ]; then
	ls -1 conf/block_tags | grep -E "\.tsv$" | while IFS= read -r file; do
		echo "Generating block tags for \"${file}\"..."
		deno run --allow-read --allow-write conf/datagen/tags.js blocks ${file}
	done
fi
if [ -e conf/ptr_tags ]; then
	ls -1 conf/ptr_tags | grep -E "\.tsv$" | while IFS= read -r file; do
		echo "Generating pointer tags for \"${file}\"..."
		deno run --allow-read --allow-write conf/datagen/tags_ptr.js ${file}
	done
fi
exit