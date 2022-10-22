import Editor from 'finer/packages/Editor';
import { PLUGIN_NAME } from 'finer/plugins/bold/Constants';
import Setup from './Setup';
import { UI } from './UI';

export default (): void => {
	finer.Managers.Plugin.Add(PLUGIN_NAME, (editor: Editor) => {
		const ui = UI(editor);
		if (!ui) return;

		Setup(editor, ui);
	});
};