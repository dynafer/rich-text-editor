import Editor from '../../packages/Editor';
import Setup from './Setup';

export default (): void => RichEditor.Loaders.Plugin.Add('table', (editor: Editor) => Setup(editor));