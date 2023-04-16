const fs = require('fs');
const path = require('path');

module.exports = async (runner) => {
	const Task = runner.Task;
	const Icons = runner.Icons;

	const buildPath = './build';
	const buildLibPath = path.join(buildPath, './lib');

	const svgPath = './svg';
	const iconPacks = fs.readdirSync(svgPath);

	const mkdirIfNotExisted = dirPath => {
		if (fs.existsSync(dirPath)) return;
		fs.mkdirSync(dirPath);
	};

	await Task.Run(async () => {
		mkdirIfNotExisted(buildPath);
		mkdirIfNotExisted(buildLibPath);
		iconPacks.forEach(iconPack => mkdirIfNotExisted(path.join(buildLibPath, `./${iconPack}`)));
	});

	iconPacks.forEach(async iconPack => await Icons.Build({
		dir: path.join(svgPath, `./${iconPack}`),
		output: path.resolve(buildLibPath, `./${iconPack}`, './IconPack.js'),
		type: 'argument',
		naming: 'Finer.Icons.Register'
	}));
};