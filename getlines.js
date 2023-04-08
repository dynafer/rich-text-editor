const fs = require('fs');
const path = require('path');

const dirs = fs.readdirSync('./packages');
dirs.splice(2, 1);
let lines = 0;

const recur = (dirPath) => {
	if (!dirPath.includes('.')) {
		try {
			const subDirs = fs.readdirSync(dirPath);
			return subDirs.forEach(dir => {
				if (dir === 'build' || dir === 'node_modules') return;
				recur(path.join(dirPath, `./${dir}`));
			});
		} catch {
			return;
		}
	}

	if (!dirPath.includes('.ts')) return;

	lines += fs.readFileSync(dirPath, 'utf-8').split('\n').length;
};

for (const dir of dirs) {
	recur(path.join('./packages', `./${dir}`));
}

console.log(lines);