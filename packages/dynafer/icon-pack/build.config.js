const fs = require('fs');
const path = require('path');

module.exports = async (runner) => {
	const Task = runner.Task;
	const Icons = runner.Icons;

	const buildPath = './build';
	const buildLibPath = path.join(buildPath, './lib');

	await Task.Run(async () => {
		if (!fs.existsSync(buildPath)) fs.mkdirSync(buildPath);
		if (!fs.existsSync(buildLibPath)) fs.mkdirSync(buildLibPath);
	});

	await Icons.Build({
		dir: './svg',
		output: path.resolve(buildLibPath, './IconPack.js'),
		type: 'argument',
		naming: 'Finer.Icons.Register'
	});
};