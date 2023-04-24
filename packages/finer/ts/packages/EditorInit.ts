import { Type } from '@dynafer/utils';
import Editor from './Editor';
import Configure, { IConfiguration, TConfigurationKey } from './EditorConfigure';

export type TEditorInit = (config: Record<string, TConfigurationKey>) => Promise<Editor | unknown>;

const EditorInit = (config: Record<string, TConfigurationKey>): Promise<Editor | unknown> => {
	if (!Type.IsString(config.iconPack)) config.iconPack = 'default';
	if (!Type.IsString(config.language)) config.language = 'en-GB';

	const configuration: IConfiguration = Configure(config);

	const before = (): Promise<void> => {
		const iconName = configuration.IconPack as string;

		return new Promise((resolve, reject) => {
			Finer.Loaders.Icon.Load(iconName)
				.catch(() => reject(`Icon.${iconName}: failed to load the icon pack`))
				.then(() => {
					if (!Type.IsString(configuration.Language)) return resolve();
					resolve(Finer.Loaders.Language.Load(configuration.Language));
				})
				.catch(() => reject(`Language.${configuration.Language}: failed to load the language pack`));
		});
	};

	return new Promise(resolve => {
		before()
			.then(() => resolve(new Editor(configuration)))
			.catch(console.error);
	});
};

export default EditorInit;