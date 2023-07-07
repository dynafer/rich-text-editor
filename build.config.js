const { nodeResolve } = require('@rollup/plugin-node-resolve');
const fs = require('fs');
const path = require('path');
const { DeleteMapFiles, GetTestArgvs, GLOBAL_NAME, INPUT_NAME, OUTPUT_PATH, PACKAGE_PATH, PLUGIN_NAMES, PROJECT_NAME, SCSS_PATH } = require('./config.setting');

module.exports = async (runner, config) => {
	const Command = runner.Command;
	const Rollup = runner.Rollup;
	const Sass = runner.Sass;
	const Task = runner.Task;
	const Test = runner.Test;
	const bDevelopment = config.Mode === 'development';

	await Task.Run(async () => {
		if (!fs.existsSync(OUTPUT_PATH)) fs.mkdirSync(OUTPUT_PATH);
		if (!fs.existsSync(path.join(OUTPUT_PATH, './skins'))) fs.mkdirSync(path.join(OUTPUT_PATH, './skins'));
	});

	await Test.Run(GetTestArgvs());

	await Command.Run({
		command: 'yarn run lint',
		watch: false
	});

	const commandSettings = [];
	const commandRegister = (dirPath) => {
		commandSettings.push({
			cd: dirPath,
			command: 'yarn run build'
		});
	};

	fs.readdirSync(PACKAGE_PATH).forEach(dir => {
		if (dir.includes(PROJECT_NAME)) return;

		const dirPath = path.join(PACKAGE_PATH, `./${dir}`);

		if (fs.existsSync(path.join(dirPath, './package.json'))) {
			commandRegister(dirPath);
			return;
		}

		fs.readdirSync(dirPath).forEach(subDir => {
			const subDirPath = path.join(dirPath, `./${subDir}`);
			if (!fs.existsSync(path.join(subDirPath, './package.json'))) return;

			commandRegister(subDirPath);
		});
	});

	await Command.Run(commandSettings);
	await Command.Run({
		cd: path.join(PACKAGE_PATH, `./${PROJECT_NAME}`),
		command: 'yarn run build'
	});

	const sassList = [];
	fs.readdirSync(SCSS_PATH).forEach(dir => {
		if (dir.includes('.scss') || dir.includes('ui') || dir.includes('elements') || dir.includes('mixins')) return;

		const dirPath = path.join(SCSS_PATH, `./${dir}`);
		fs.readdirSync(dirPath).forEach(subDir => {
			const subDirPath = path.join(dirPath, `./${subDir}`);

			const outputPath = path.join(OUTPUT_PATH, `./skins/${subDir}`);
			if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

			sassList.push({
				input: path.join(subDirPath, './skin.scss'),
				output: path.join(outputPath, './skin.min.css'),
				compressed: true
			});
		});
	});

	sassList.push({
		input: path.join(SCSS_PATH, `./Editor.scss`),
		output: path.join(OUTPUT_PATH, `./skins/Editor.min.css`),
		compressed: true
	});

	await Sass.Run(sassList);

	if (!bDevelopment) DeleteMapFiles();

	const outputOption = (filename) => ({
		file: path.resolve(OUTPUT_PATH, `./${filename}.js`),
		format: 'iife',
		createUglified: true,
		sourcemap: bDevelopment
	});

	const inputPath = path.resolve(PACKAGE_PATH, `./${PROJECT_NAME}/build/lib`);

	const rollups = [
		{
			input: path.resolve(inputPath, `./${INPUT_NAME}.js`),
			output: [
				{
					...outputOption(PROJECT_NAME),
					name: GLOBAL_NAME
				},
			],
			plugins: [
				nodeResolve()
			]
		}
	];

	const iconPacksDir = path.resolve(PACKAGE_PATH, './dynafer/icon-pack/build/lib');

	const iconPacks = fs.readdirSync(iconPacksDir);
	iconPacks.forEach(iconPack => rollups.push({
		input: path.join(iconPacksDir, `./${iconPack}`, './IconPack.js'),
		output: [
			{
				...outputOption(`icons/${iconPack}/icons`),
				globals: {
					RichEditor: GLOBAL_NAME
				}
			},
		],
	}));

	PLUGIN_NAMES.forEach(name => {
		if (name.includes('template')) return;
		rollups.push({
			input: path.resolve(inputPath, `./plugins/${name}/Index.js`),
			output: [
				{
					...outputOption(`plugins/${name}/${name}`),
					globals: {
						RichEditor: GLOBAL_NAME
					}
				},
			],
			plugins: [
				nodeResolve()
			]
		});
	});

	Rollup.Register(rollups);

	await Rollup.Run();
};