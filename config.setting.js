const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = './build';
const PROJECT_NAME = 'finer';

const INPUT_NAME = PROJECT_NAME.split('').reduce((pre, cur, index) => `${index === 1 ? pre.toUpperCase() : pre}${cur}`);

const PACKAGE_PATH = './packages';
const PLUGIN_NAMES = fs.readdirSync(path.join(PACKAGE_PATH, './finer/ts/plugins'));

const SCSS_PATH = path.join(PACKAGE_PATH, './scss');

const DeleteMapFile = (extenstion, name = '') => {
	const dirPath = name !== '' ? path.join(OUTPUT_PATH, './plugins') : OUTPUT_PATH;
	const fileName = name !== '' ? `${name}/${name}` : PROJECT_NAME;
	const filePath = `./${fileName}.${extenstion}.map`;
	const realPath = path.join(dirPath, filePath);

	if (fs.existsSync(realPath)) fs.unlinkSync(realPath);
};

const DeleteMapFiles = () => {
	for (const name of PLUGIN_NAMES) {
		DeleteMapFile('js', name);
		DeleteMapFile('min.js', name);
	}

	DeleteMapFile('js');
	DeleteMapFile('min.js');
	DeleteMapFile('min.css');
};

module.exports = {
	DeleteMapFiles,
	INPUT_NAME,
	OUTPUT_PATH,
	PACKAGE_PATH,
	PLUGIN_NAMES,
	PROJECT_NAME,
	SCSS_PATH,
};