import { Type } from '@dynafer/utils';
import Editor from './Editor';
import { IEditorConfiguration } from './EditorConfigure';

export interface IEditorInit {
	(config: IEditorConfiguration): Promise<Editor>;
}

const EditorInit = (config: IEditorConfiguration): Promise<Editor> => {
	const before = (): Promise<void> => {
		const iconName = Type.IsString(config.iconPack) ? config.iconPack : 'default';

		return new Promise((resolve, reject) => {
			Finer.Loaders.Icon.Load(iconName)
				.catch(() => reject(`Icon.${iconName}: failed to load the icon pack`))
				.then(() => {
					if (!Type.IsString(config.language)) return resolve();
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