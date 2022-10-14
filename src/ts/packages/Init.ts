import PluginLoader from 'finer/packages/plugin/PluginLoader';
import SetDefaultToConfig, { TConfiguration, IConfiguration } from './Configuration';
import EditorFrame from './EditorFrame';
import DOM from './dom/DOM';

const Init = (config: IMap<TConfiguration>): Promise<void> => {
	return new Promise((resolve, reject) => {
		const configuration: IConfiguration = SetDefaultToConfig(config);

		DOM.SetStyle(configuration.selector, 'display', 'none');

		EditorFrame(configuration.selector, configuration.mode, configuration.width, configuration.height);

		PluginLoader.LoadParallel(configuration.plugins)
			.then(() => finer.managers.plugin.LoadAll())
			.catch(error => reject(error));

		resolve();
	});
};

export default Init;