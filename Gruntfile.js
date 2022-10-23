const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { OUTPUT_PATH, PROJECT_NAME, PACKAGE_PATH, SCSS_PATH, INPUT_NAME } = require('./config.shared');
const sass = require('sass');

module.exports = function(grunt) {
	const buildList = ['mkdir'];

	grunt.registerTask('mkdir', 'Make required directories', function() {
		if (!fs.existsSync(OUTPUT_PATH)) fs.mkdirSync(OUTPUT_PATH);
		if (!fs.existsSync(path.resolve(OUTPUT_PATH, './skins'))) fs.mkdirSync(path.resolve(OUTPUT_PATH, './skins'));
	});

	const register = (folderPath, folderName) => {
		grunt.registerTask(`build:${folderName}`, `Build ${folderPath}`, function() {
			const async = this.async();

			exec(`cd ${folderPath} && yarn run build`, (error, stdout, stderr) => {
				if (error || stderr) {
					console.error(`Build ${folderPath} error: ${error ?? stderr}`);
					return;
				}

				async(stdout);
			});
		});

		buildList.push(`build:${folderName}`);
	};

	for (const folder of fs.readdirSync(PACKAGE_PATH)) {
		if (folder.includes(PROJECT_NAME)) continue;

		const folderPath = path.resolve(PACKAGE_PATH, `./${folder}`);

		if (fs.existsSync(path.resolve(folderPath, './package.json'))) {
			register(folderPath, folder);
		} else {
			for (const subfolder of fs.readdirSync(folderPath)) {
				const subfolderPath = path.resolve(folderPath, `./${subfolder}`);
				if (fs.existsSync(path.resolve(subfolderPath, './package.json'))) {
					register(subfolderPath, `${folder}:${subfolder}`);
				}
			}
		}
	}

	register(path.resolve(PACKAGE_PATH, `./${PROJECT_NAME}`), PROJECT_NAME);

	grunt.registerTask('scss', 'Compile SCSS files', function() {
		const async = this.async();

		const scssList = [];

		const pushScssList = (output, input) => {
			scssList.push(fs.writeFile(output, input, 'utf8', (error) => {
				if (error) {
					console.error(`Compile SCSS error: ${error}`);
					return;
				}
			}));
		};

		for (const folder of fs.readdirSync(SCSS_PATH)) {
			if (folder.includes('.scss')) continue;

			const folderPath = path.resolve(SCSS_PATH, `./${folder}`);
			for (const subfolder of fs.readdirSync(folderPath)) {
				const subfolderPath = path.resolve(folderPath, `./${subfolder}`);

				const compressed = sass.compile(path.resolve(subfolderPath, './skin.scss'), {style: "compressed"});
				const outputPath = path.resolve(OUTPUT_PATH, `./skins/${subfolder}`);
				if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

				pushScssList(path.resolve(outputPath, './skin.min.css'), compressed.css);
			}
		}

		const projectCompressed = sass.compile(path.resolve(SCSS_PATH, `./${INPUT_NAME}.scss`), {style: "compressed"});
		pushScssList(path.resolve(OUTPUT_PATH, `./${PROJECT_NAME}.min.css`), projectCompressed.css);

		Promise.all(scssList)
			.then(() => async());
	});

	grunt.registerTask('rollup', 'Rolling up the project', function() {
		const async = this.async();

		exec(`yarn run lint && yarn run finer-rollup`, (error, stdout, stderr) => {
			if (error || stderr) {
				console.error(`Rollup error: ${error ?? stderr}`);
				return;
			}

			async(stdout);
		});
	});

	grunt.registerTask('default', [...buildList, 'scss', 'rollup']);
}