import Editor from './Editor';
import { IEditorOption } from './EditorConfigure';

export interface IEditorInit {
	(config: IEditorOption): Promise<Editor>;
}

const EditorInit = (config: IEditorOption): Promise<Editor> =>
	new Promise((resolve, reject) => {
		Finer.Loaders.Icon.Load('default')
			.then(() => resolve(new Editor(config)))
			.catch(() => reject('Can\'t find default icon pack.'));
	});

export default EditorInit;