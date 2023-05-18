import { Type } from '@dynafer/utils';
import Editor, { ELoadingStatus } from './Editor';
import Configure, { IConfiguration, TConfigurationKey } from './EditorConfigure';
import EditorSetup from './EditorSetup';
import { ENotificationStatus } from './managers/NotificationManager';

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
			.then(() => {
				const editor = new Editor(configuration);
				EditorSetup(editor)
					.then(() => {
						editor.ToggleLoading(ELoadingStatus.HIDE);
						resolve(editor);
					})
					.catch(error => editor.Notify(ENotificationStatus.ERROR, error, true));
			})
			.catch(console.error);
	});
};

export default EditorInit;