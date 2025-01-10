"use strict";

import TextReader from "https://jsr.io/@ltgc/rochelle/0.2.2/dist/textRead.mjs";

let globalMap = {};

const datapackId = Deno.args[1].replace(".tsv", "");
const datapackType = Deno.args[0];
const dataReadDir = ({
	"items": "item",
	"block": "block"
})[datapackType] || "";
if (!dataReadDir) {
	console.error(`Unknown datapack type: ${datapackType}`);
	Deno.exit(1);
};
self.Deno.hasFileSync = (path) => {
	try {
		Deno.statSync(path);
		return true;
	} catch (err) {
		return false;
	};
};
self.Deno.hasFile = async (path) => {
	try {
		await Deno.stat(path);
		return true;
	} catch (err) {
		return false;
	};
};
let getNamespacedPath = (datapackId, namespacedId, type) => {
	let splitter = namespacedId.indexOf(":");
	return `./src/${datapackId}/data/${namespacedId.substring(0, splitter)}/tags/${type}/${namespacedId.substring(splitter + 1)}.json`;
};
let getNamespacedFolder = (datapackId, namespacedId, type) => {
	let splitter = namespacedId.indexOf(":");
	let splitPath = namespacedId.substring(splitter + 1).split("/");
	splitPath.pop();
	return `./src/${datapackId}/data/${namespacedId.substring(0, splitter)}/tags/${type}/${splitPath.join("/")}`;
};
let getGeneratedData = (data) => {
	let values = [];
	for (let value of data) {
		values.push(value);
	};
	values.sort();
	return JSON.stringify({values});
};

// Parse all of the maps

for await (let line of TextReader.line((await Deno.open(`./conf/${dataReadDir}_tags/${datapackId}.tsv`)).readable)) {
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
		let supposedPath = getNamespacedFolder(datapackId, category, datapackType);
		if (!Deno.hasFileSync(supposedPath)) {
			await Deno.mkdir(supposedPath, {"recursive": true});
			console.debug(`Creating new folder under "${supposedPath}"...`);
		};
		await Deno.writeTextFile(getNamespacedPath(datapackId, category, datapackType), getGeneratedData(globalMap[category]));
	} catch (err) {
		console.error(err);
	};
};