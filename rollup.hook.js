import { spawnSync } from 'child_process';

process.env.ranEslint = 0;

export function run(command) {
	return {
		name: 'run',
		renderStart: function () {
			++process.env.ranEslint;
			if (process.env.ranEslint % 2 === 0) return;
			spawnSync(command, {
				shell: true,
				stdio: 'inherit',
				env: process.env
			});
		}
	};
}