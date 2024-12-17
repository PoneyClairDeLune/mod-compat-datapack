#!/bin/bash
shx generate
ls -1 build/*.zip | while IFS= read -r file; do
	rm -v "${file}"
done
cd src
ls -1 . | while IFS= read -r folder; do
	cd "${folder}"
	echo "Generating \"${folder}.zip\"..."
	zip -r9q "../../build/${folder}.zip" * .*
	cd ..
done
exit