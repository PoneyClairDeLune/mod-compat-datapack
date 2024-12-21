"use strict";

import TextReader from "https://jsr.io/@ltgc/rochelle/0.2.2/dist/textRead.mjs";

let globalMap = {};

const datapackId = Deno.args[1].replace(".tsv", "");
const datapackType = Deno.args[0];
let getNamespacedPath = (datapackId, namespacedId, type) => {
	let splitter = namespacedId.indexOf(":");
	return `./src/${datapackId}/data/${namespacedId.substring(0, splitter)}/tags/${type}/${namespacedId.substring(splitter + 1)}.json`;
};
let getGeneratedData = (data) => {
	let values = [];
	for (let value of data) {
		values.push(value);
	};
	return JSON.stringify({values});
};

// Parse all of the maps

for await (let line of TextReader.line((await Deno.open(`./conf/item_tags/${datapackId}.tsv`)).readable)) {
	if (line.indexOf(":") < 0) {
		continue;
	};
	let linkDetail = line.split("\t");
	let categories = linkDetail[1].split(",");
	for (let category of categories) {
		let targetSet;
		if (globalMap[category]?.constructor) {
			targetSet = globalMap[category];
		} else {
			console.debug(`Created category: ${category}`);
			targetSet = new Set();
			globalMap[category] = targetSet;
		};
		targetSet.add(linkDetail[0]);
	};
};

//console.debug(globalMap);

// Write all of the maps
for (let category in globalMap) {
	console.debug(`Writing "${getNamespacedPath(datapackId, category, datapackType)}"...`);
	try {
		await Deno.writeTextFile(getNamespacedPath(datapackId, category, datapackType), getGeneratedData(globalMap[category]));
	} catch (err) {
		console.error(err);
	};
};