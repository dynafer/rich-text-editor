const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = './build';
const PROJECT_NAME = 'finer';
const GLOBAL_NAME = 'Finer';

const INPUT_NAME = PROJECT_NAME.split('').reduce((pre, cur, index) => `${index === 1 ? pre.toUpperCase() : pre}${cur}`);

const PACKAGE_PATH = './packages';
const PLUGIN_NAMES = fs.readdirSync(path.join(PACKAGE_PATH, './finer/ts/plugins'));

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

const GetJestARGVs = () => {
	const options = {
		preset: 'ts-jest',
		testEnvironment: 'jest-environment-jsdom',
		testMatch: '**/packages/**/test/All.test.ts',
		detectOpenHandles: true,
		silent: true,
		moduleNameMapper: {
			'@dynafer/utils': '<rootDir>/packages/dynafer/utils/ts/Index.ts',
		},
	};

	const argvs = [];
	Object.entries(options, ([key, value]) => {
		argvs.push(`--${key}`);
		if (typeof value === 'boolean') return;
		if (typeof value === 'string') return argvs.push(value);
		argvs.push(JSON.stringify(value));
	});

	return argvs;
};

module.exports = {
	DeleteMapFiles,
	GetJestARGVs,
	GLOBAL_NAME,
	INPUT_NAME,
	OUTPUT_PATH,
	PACKAGE_PATH,
	PLUGIN_NAMES,
	PROJECT_NAME,
	SCSS_PATH,
};