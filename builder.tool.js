const { Builder } = require('@dynafer/builder-tool');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const fs = require('fs');
const path = require('path');
const { terser } = require('rollup-plugin-terser');
const InlineSvg = require('rollup-plugin-inline-svg');
const { DeleteMapFiles, INPUT_NAME, IS_DEVELOPMENT, OUTPUT_PATH, PACKAGE_PATH, PLUGIN_NAMES, PROJECT_NAME, SCSS_PATH } = require('./config.shared');

async function run() {
	const builder = Builder();
	const Command = builder.Runner.Command;
	const Rollup = builder.Runner.Rollup;
	const Sass = builder.Runner.Sass;
	const Task = builder.Runner.Task;

	await Task.Run(async () => {
		if (!fs.existsSync(OUTPUT_PATH)) fs.mkdirSync(OUTPUT_PATH);
		if (!fs.existsSync(path.join(OUTPUT_PATH, './skins'))) fs.mkdirSync(path.join(OUTPUT_PATH, './skins'));
	});

	const commandSettings = [];
	const commandRegister = (dirPath) => {
		commandSettings.push({
			workDir: dirPath,
			command: 'yarn run build'
		});
	};

	for (const dir of fs.readdirSync(PACKAGE_PATH)) {
		if (dir.includes(PROJECT_NAME)) continue;

		const dirPath = path.join(PACKAGE_PATH, `./${dir}`);

		if (fs.existsSync(path.join(dirPath, './package.json'))) {
			commandRegister(dirPath);
		} else {
			for (const subDir of fs.readdirSync(dirPath)) {
				const subDirPath = path.join(dirPath, `./${subDir}`);
				if (fs.existsSync(path.join(subDirPath, './package.json'))) {
					commandRegister(subDirPath);
				}
			}
		}
	}

	await Command.Run(commandSettings);

	await Command.Run({
		workDir: path.join(PACKAGE_PATH, `./${PROJECT_NAME}`),
		command: 'yarn run build'
	});

	const sassList = [];
	for (const dir of fs.readdirSync(SCSS_PATH)) {
		if (dir.includes('.scss')) continue;

		const dirPath = path.join(SCSS_PATH, `./${dir}`);
		for (const subDir of fs.readdirSync(dirPath)) {
			const subDirPath = path.join(dirPath, `./${subDir}`);

			const outputPath = path.join(OUTPUT_PATH, `./skins/${subDir}`);
			if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

			sassList.push({
				input: path.join(subDirPath, './skin.scss'),
				output: path.join(outputPath, './skin.min.css'),
				compressed: true
			});
		}
	}

	sassList.push({
		input: path.join(SCSS_PATH, `./${INPUT_NAME}.scss`),
		output: path.join(OUTPUT_PATH, `./${PROJECT_NAME}.min.css`),
		compressed: true
	})

	await Sass.Run(sassList);

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

	Rollup.Register(rollups);

	await Command.Run({
		command: 'yarn run lint'
	});

	await Rollup.Run();
}

run();