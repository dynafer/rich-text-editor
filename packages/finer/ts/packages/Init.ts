import SetDefaultToConfig, { TConfiguration, IConfiguration } from 'finer/packages/Configuration';
import PluginLoader from 'finer/packages/loaders/PluginLoader';
import Editor from 'finer/packages/Editor';
import EditorFrame from 'finer/packages/EditorFrame';

const Init = (config: Record<string, TConfiguration>): Promise<Editor> => {
	return new Promise((resolve, reject) => {
		const configuration: IConfiguration = SetDefaultToConfig(config);

		PluginLoader.LoadParallel(configuration.Plugins)
			.then(() => {
				const frame = EditorFrame(configuration);
		
				const editor = new Editor(configuration, frame);
				resolve(editor);
			})
			.catch(error => reject(error));
	});
};

export default Init;