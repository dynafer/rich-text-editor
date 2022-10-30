import Editor from '../../packages/Editor';
import { PLUGIN_NAME } from './Constants';
import Setup from './Setup';
import { UI } from './UI';

export default (): void => {
	finer.Loaders.Plugin.Add(PLUGIN_NAME, (editor: Editor) => {
		const ui = UI(editor);
		if (!ui) return;

		Setup(editor, ui);
	});
};