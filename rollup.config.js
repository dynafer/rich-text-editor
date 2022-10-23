import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import InlineSvg from 'rollup-plugin-inline-svg';
import path from 'path';
const { DeleteMapFiles, INPUT_NAME, IS_DEVELOPMENT, PROJECT_NAME, OUTPUT_PATH, PACKAGE_PATH, PLUGIN_NAMES } = require('./config.shared');

if (!IS_DEVELOPMENT) DeleteMapFiles();

const outputOption = (filename, extension) => {
	return {
		file: path.resolve(OUTPUT_PATH, `./${filename}.${extension}`),
		format: 'iife',
		sourcemap: IS_DEVELOPMENT
	}
};

const inputPath = path.resolve(PACKAGE_PATH, './finer/build/lib');

const rollups = [
	{
		input: path.resolve(inputPath, `./${INPUT_NAME}.js`),
		output: [
			{
				...outputOption(PROJECT_NAME, 'js'),
				name: PROJECT_NAME
			},
			{
				...outputOption(PROJECT_NAME, 'min.js'),
				name: PROJECT_NAME,
				plugins: [terser()]
			},
		],
		plugins: [
			nodeResolve(),
			InlineSvg()
		]
	}
];

for (const name of PLUGIN_NAMES) {
	if (name.includes('.d.ts')) continue;
	rollups.push({
		input: path.resolve(inputPath, `./plugins/${name}/Index.js`),
		output: [
			{
				...outputOption(`plugins/${name}/${name}`, 'js'),
				globals: {
					finer: PROJECT_NAME
				}
			},
			{
				...outputOption(`plugins/${name}/${name}`, 'min.js'),
				globals: {
					finer: PROJECT_NAME
				},
				plugins: [terser()]
			},
		],
		plugins: [
			nodeResolve(),
			InlineSvg()
		]
	});
}

export default rollups;