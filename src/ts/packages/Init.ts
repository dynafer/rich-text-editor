import PluginLoader from 'finer/packages/plugin/PluginLoader';
import IConfiguration from './Configuration';
import { IsArray } from 'finer/packages/utils/Type';

const Init = (config: IConfiguration): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (!config.selector) return reject('Selector of configuration must be provided');
		if (config.plugins) {
			if (!IsArray(config.plugins)) return reject('Plugins of configuration must be array');

			PluginLoader.LoadParallel(config.plugins)
				.then(() => finer.managers.plugin.LoadAll())
				.catch(error => reject(error));
		}

		resolve();
	});
};

export default Init;