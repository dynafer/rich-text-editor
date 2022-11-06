import Editor from '../../packages/Editor';
import Setup from './Setup';
import { UI } from './UI';

export default (): void => {
	finer.Loaders.Plugin.Add('template name', (editor: Editor) => {
		UI(editor);
		Setup(editor);
	});
	/*
		Plugin Setup...
		finer.Loaders.Plugin.Add('plugin name', (editor: Editor) => {
			const ui = UI(editor);
			if (!ui) return;

			Setup(editor, ui);
		});
	*/
};