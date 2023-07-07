import Editor from '../../packages/Editor';
import Setup from './Setup';

export default (): void => RichEditor.Loaders.Plugin.Add('link', (editor: Editor) => Setup(editor));