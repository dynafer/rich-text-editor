import Editor from './Editor';
import { IEditorConfiguration } from './EditorConfigure';

export interface IEditorInit {
	(config: IEditorConfiguration): Promise<Editor>;
}

const EditorInit = (config: IEditorConfiguration): Promise<Editor> =>
	new Promise((resolve, reject) => {
		Finer.Loaders.Icon.Load('default')
			.catch(() => reject('Can\'t find default icon pack.'))
			.then(() => resolve(new Editor(config)))
			.catch(console.error);
	});

export default EditorInit;