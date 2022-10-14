import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import scss from 'rollup-plugin-scss';
import path from 'path';
import { run } from './rollup.hook';
import { DeleteMapFiles, ESLINT_RUN_COMMAND, IS_DEVELOPMENT, INPUT_FILE_NAME, OUTPUT_FILE_NAME, OUTPUT_PATH, PACKAGE_PATH, USE_SCSS } from './rollup.shared';

require('dotenv').config({ path: path.resolve(__dirname, './.env') });

if (!IS_DEVELOPMENT) DeleteMapFiles();

if (IS_DEVELOPMENT) ROLLUP_PLUGINS.push(run(ESLINT_RUN_COMMAND));

export default {
	input: path.resolve(PACKAGE_PATH, `./finer/ts/${INPUT_FILE_NAME}.ts`),
	output: [
		{
			file: path.resolve(OUTPUT_PATH, `./${OUTPUT_FILE_NAME}.js`),
			format: 'iife',
			name: 'finer',
			sourcemap: IS_DEVELOPMENT
		},
		{
			file: path.resolve(OUTPUT_PATH, `./${OUTPUT_FILE_NAME}.min.js`),
			format: 'iife',
			name: 'finer',
			plugins: [terser()],
			sourcemap: IS_DEVELOPMENT
		},
	],
	plugins: [
		scss({
			includePaths: [path.resolve(PACKAGE_PATH, './scss/')],
			output: path.resolve(OUTPUT_PATH, `./${OUTPUT_FILE_NAME}.min.css`),
			sourceMap: IS_DEVELOPMENT,
			outputStyle: 'compressed',
			failOnError: true,
			watch: PACKAGE_PATH
		}),
		typescript({
			tsconfig: path.resolve(__dirname, './tsconfig.json'),
			outputToFilesystem: true,
			compilerOptions: {
				sourceMap: IS_DEVELOPMENT
			}
		})
	]
};