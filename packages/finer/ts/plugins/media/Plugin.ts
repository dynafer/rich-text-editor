import Editor from '../../packages/Editor';
import Setup from './Setup';

export default (): void => {
	Finer.Loaders.Plugin.Add('media', (editor: Editor) => {
		Setup(editor);
	});
};