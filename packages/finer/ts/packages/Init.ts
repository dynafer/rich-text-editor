import PluginLoader from 'finer/packages/plugin/PluginLoader';
import SetDefaultToConfig, { TConfiguration, IConfiguration } from 'finer/packages/Configuration';
import EditorFrame from 'finer/packages/EditorFrame';
import DOM from 'finer/packages/dom/DOM';

const Init = (config: Record<string, TConfiguration>): Promise<void> => {
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