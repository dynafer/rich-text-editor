import SetDefaultToConfig, { TConfiguration, IConfiguration } from 'finer/packages/Configuration';
import PluginLoader from 'finer/packages/loaders/PluginLoader';
import Editor from 'finer/packages/Editor';

const Init = (config: Record<string, TConfiguration>): Promise<Editor> => {
	return new Promise((resolve, reject) => {
		const configuration: IConfiguration = SetDefaultToConfig(config);

		PluginLoader.LoadParallel(configuration.Plugins)
			.then(() => {
				const editor = new Editor(configuration);
				resolve(editor);
			})
			.catch(error => reject(error));
	});
};

export default Init;