const fs = require('fs');
const path = require('path');

const svgPath = path.resolve(__dirname, './ts/packages/icons/svg');
const buildPath = path.resolve(__dirname, './build/lib/packages/icons/svg');

if (!fs.existsSync(buildPath)) fs.mkdirSync(buildPath);

for (const svg of fs.readdirSync(svgPath)) {
	fs.copyFileSync(path.resolve(svgPath, `./${svg}`), path.resolve(buildPath, `./${svg}`));
}