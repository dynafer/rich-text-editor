import Editor from '../../packages/Editor';
import Setup from './Setup';

export default (): void => {
	Finer.Loaders.Plugin.Add('lists', (editor: Editor) => {
		Setup(editor);
	});
};