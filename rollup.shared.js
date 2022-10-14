import fs from 'fs';
import path from 'path';

require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const OUTPUT_PATH = path.resolve(__dirname, process.env.OUTPUT_PATH);
const OUTPUT_PLUGIN_PATH = path.resolve(OUTPUT_PATH, './plugins');
const USE_SCSS = process.env.USE_SCSS === 'true';
const IS_DEVELOPMENT = process.env.MODE === 'development';
const OUTPUT_FILE_NAME = process.env.OUTPUT_FILE_NAME;
const INPUT_FILE_NAME = process.env.INPUT_FILE_NAME;

const SRC_PATH = path.resolve(__dirname, './src');
const PLUGIN_PATH = path.resolve(SRC_PATH, './ts/plugins');
const PLUGIN_NAMES = fs.readdirSync(PLUGIN_PATH);

const ESLINT_RUN_COMMAND = 'npm run lint';

const DeleteMapFile = (extenstion, name = '') => {
	const dirPath = name !== '' ? OUTPUT_PLUGIN_PATH : OUTPUT_PATH;
	const fileName = name !== '' ? `${name}/${name}` : OUTPUT_FILE_NAME;
	const filePath = `./${fileName}.${extenstion}.map`;
	const realPath = path.resolve(dirPath, filePath);

	if (fs.existsSync(realPath)) fs.unlinkSync(realPath);
};

const DeleteMapFiles = (type = '') => {
	if (type === 'plugin') {
		for (const name of PLUGIN_NAMES) {
			DeleteMapFile('js', name);
			DeleteMapFile('min.js', name);
		}
		return;
	}

	DeleteMapFile('js');
	DeleteMapFile('min.js');
	DeleteMapFile('min.css');
};

export {
	DeleteMapFiles,
	ESLINT_RUN_COMMAND,
	IS_DEVELOPMENT,
	INPUT_FILE_NAME,
	OUTPUT_FILE_NAME,
	OUTPUT_PATH,
	OUTPUT_PLUGIN_PATH,
	PLUGIN_NAMES,
	PLUGIN_PATH,
	SRC_PATH,
	USE_SCSS,
};