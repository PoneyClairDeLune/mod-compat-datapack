"use strict";

import TextReader from "https://jsr.io/@ltgc/rochelle/0.2.2/dist/textRead.mjs";

let globalMap = {};

const datapackId = Deno.args[0].replace(".tsv", "");
switch (datapackType) {
	case "items":
	case "block": {
		break;
	};
	default: {
		console.error(`Unknown datapack type: ${datapackType}`);
		Deno.exit(1);
	};
};
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
let getReferredData = async (datapackId, namespacedId, type) => {
	return JSON.parse(await Deno.readTextFile(getNamespacedPath(datapackId, namespacedId, type))).values;
};

// Parse all of the maps

for await (let line of TextReader.line((await Deno.open(`./conf/ptr_tags/${datapackId}.tsv`)).readable)) {
	if (line.indexOf(":") < 0) {
		continue;
	};
	let linkDetail = line.split("\t");
	let pointers = linkDetail[1].split(",");
	let category = linkDetail[0];
	let targetSet;
	if (globalMap[category]?.constructor) {
		targetSet = globalMap[category];
	} else {
		console.debug(`Created category: ${category}`);
		targetSet = new Set();
		globalMap[category] = targetSet;
	};
	for (let pointer of pointers) {
		let readValuesFrom, readValues;
		switch (pointer.charCodeAt(0)) {
			case 35: {
				// "#" indicates item tag referring, requires file read.
				readValuesFrom = "items";
				break;
			};
			case 37: {
				// "%" indicates block tag referring, requires file read.
				readValuesFrom = "block";
				break;
			};
		};
		if (readValuesFrom) {
			readValues = await getReferredData(datapackId, pointer.substring(1), readValuesFrom);
		};
		if (readValues) {
			for (let value of readValues) {
				targetSet.add(value);
			};
		};
	};
};

//console.debug(globalMap);

// Write all of the maps
for (let rawCategory in globalMap) {
	let category = rawCategory.substring(1);
	let targetType;
	switch (rawCategory.charCodeAt(0)) {
		case 35: {
			// Item
			targetType = "items";
			break;
		};
		case 37: {
			// Block
			targetType = "block";
			break;
		};
	};
	console.debug(`Writing "${getNamespacedPath(datapackId, category, targetType)}"...`);
	try {
		await Deno.writeTextFile(getNamespacedPath(datapackId, category, targetType), getGeneratedData(globalMap[category]));
	} catch (err) {
		console.error(err);
	};
};