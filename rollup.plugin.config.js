import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import path from 'path';
import { run } from './rollup.hook';
import { DeleteMapFiles, ESLINT_RUN_COMMAND, IS_DEVELOPMENT, OUTPUT_PLUGIN_PATH, PLUGIN_NAMES, PLUGIN_PATH } from './rollup.shared';

if (!IS_DEVELOPMENT) DeleteMapFiles('plugin');

const ROLLUP_PLUGINS = [];
if (IS_DEVELOPMENT) ROLLUP_PLUGINS.push(run(ESLINT_RUN_COMMAND));

const rollups = [];
for (const name of PLUGIN_NAMES) {
	rollups.push({
		input: path.resolve(PLUGIN_PATH, `./${name}/Plugin.ts`),
		output: [
			{
				file: path.resolve(OUTPUT_PLUGIN_PATH, `./${name}/${name}.js`),
				format: 'iife',
				globals: {
					finer: 'finer'
				},
				sourcemap: IS_DEVELOPMENT
			},
			{
				file: path.resolve(OUTPUT_PLUGIN_PATH, `./${name}/${name}.min.js`),
				format: 'iife',
				globals: {
					finer: 'finer'
				},
				plugins: [terser()],
				sourcemap: IS_DEVELOPMENT
			},
		],
		plugins: [
			...ROLLUP_PLUGINS,
			typescript({
				tsconfig: path.resolve(__dirname, './tsconfig.json'),
				compilerOptions: {
					sourceMap: IS_DEVELOPMENT
				}
			})
		]
	});
}

export default rollups;