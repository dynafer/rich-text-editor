import Editor from 'finer/packages/Editor';
import Configure, { TConfiguration, IConfiguration } from 'finer/packages/EditorConfigure';
import PluginLoader from 'finer/packages/loaders/PluginLoader';

const Init = (config: Record<string, TConfiguration>): Promise<Editor> => {
	return new Promise((resolve, reject) => {
		const configuration: IConfiguration = Configure(config);

		PluginLoader.LoadParallel(configuration.Plugins)
			.then(() => {
				const editor = new Editor(configuration);
				resolve(editor);
			})
			.catch(error => reject(error));
	});
};

export default Init;