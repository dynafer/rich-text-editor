import { Type } from '@dynafer/utils';
import Editor from './Editor';
import { TConfigurationKey } from './EditorConfigure';

export type TEditorInit = (config: Record<string, TConfigurationKey>) => Promise<Editor>;

const EditorInit = (config: Record<string, TConfigurationKey>): Promise<Editor> => {
	if (!Type.IsString(config.iconPack)) config.iconPack = 'default';

	const before = (): Promise<void> => {
		const iconName = config.iconPack as string;

		return new Promise((resolve, reject) => {
			Finer.Loaders.Icon.Load(iconName)
				.catch(() => reject(`Icon.${iconName}: failed to load the icon pack`))
				.then(() => {
					if (!Type.IsString(config.language)) {
						config.language = 'en-GB';
						return resolve();
					}
					return resolve(Finer.Loaders.Language.Load(config.language));
				})
				.catch(() => reject(`Language.${config.language}: failed to load the language pack`));
		});
	};

	return new Promise(resolve => {
		before()
			.then(() => resolve(new Editor(config)))
			.catch(console.error);
	});
};

export default EditorInit;