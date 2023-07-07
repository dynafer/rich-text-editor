const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = './build';
const PROJECT_NAME = 'editor';
const GLOBAL_NAME = 'RichEditor';

const INPUT_NAME = GLOBAL_NAME;

const PACKAGE_PATH = './packages';
const PLUGIN_NAMES = fs.readdirSync(path.join(PACKAGE_PATH, './editor/ts/plugins'));

const SCSS_PATH = path.join(PACKAGE_PATH, './scss');

const deleteMapFile = (extenstion, name = '') => {
	const dirPath = name !== '' ? path.join(OUTPUT_PATH, './plugins') : OUTPUT_PATH;
	const fileName = name !== '' ? `${name}/${name}` : PROJECT_NAME;
	const filePath = `./${fileName}.${extenstion}.map`;
	const realPath = path.join(dirPath, filePath);

	if (fs.existsSync(realPath)) fs.unlinkSync(realPath);
};

const DeleteMapFiles = () => {
	for (let index = 0, length = PLUGIN_NAMES.length; index < length; ++index) {
		const name = PLUGIN_NAMES[index];
		deleteMapFile('js', name);
		deleteMapFile('min.js', name);
	}

	deleteMapFile('js');
	deleteMapFile('min.js');
	deleteMapFile('min.css');
};

const GetTestArgvs = () => ({
	preset: 'ts-jest',
	testEnvironment: 'jest-environment-jsdom',
	testMatch: ['<rootDir>/packages/**/test/All.test.ts'],
	detectLeaks: true,
	moduleNameMapper: {
		'@dynafer/colorpicker': ['<rootDir>/packages/dynafer/colorpicker/ts/ColorPicker.ts'],
		'@dynafer/dom-control': ['<rootDir>/packages/dynafer/dom-control/ts/DOMControl.ts'],
		'@dynafer/interlocaliser': ['<rootDir>/packages/dynafer/interlocaliser/ts/Interlocaliser.ts'],
		'@dynafer/sketcher': ['<rootDir>/packages/dynafer/sketcher/ts/Sketcher.ts'],
		'@dynafer/utils': ['<rootDir>/packages/dynafer/utils/ts/Index.ts'],
	},
});

module.exports = {
	DeleteMapFiles,
	GetTestArgvs,
	GLOBAL_NAME,
	INPUT_NAME,
	OUTPUT_PATH,
	PACKAGE_PATH,
	PLUGIN_NAMES,
	PROJECT_NAME,
	SCSS_PATH,
};