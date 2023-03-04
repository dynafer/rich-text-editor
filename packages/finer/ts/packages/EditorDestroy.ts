import DOM from './dom/DOM';
import Editor from './Editor';

export interface IEditorDestroy {
	Destroy: (editor: Editor) => void,
}

const EditorDestroy = (): IEditorDestroy => {
	const Destroy = (editor: Editor) => {
		DOM.Remove(editor.Frame.Root, true);
	};

	return {
		Destroy
	};
};

export default EditorDestroy();