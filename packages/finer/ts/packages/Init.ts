import SetDefaultToConfig, { TConfiguration, IConfiguration } from 'finer/packages/Configuration';
import Editor from './Editor';

const Init = (config: Record<string, TConfiguration>): Promise<Editor> => {
	return new Promise((resolve, reject) => {
		const configuration: IConfiguration = SetDefaultToConfig(config);

		finer.loaders.plugin.LoadParallel(configuration.plugins)
			.then(() => {
				const editor = new Editor(configuration);
				resolve(editor);
			})
			.catch(error => reject(error));
	});
};

export default Init;