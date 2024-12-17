#!/bin/bash
ls -1 conf/item_categories | while IFS= read -r file; do
	echo "Generating food tags for \"${file}\"..."
	deno run --allow-read --allow-write conf/item_cat_gen.js ${file}
done;
exit