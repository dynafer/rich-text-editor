import Editor from './Editor';

export interface IEditorDestroy {
	Destroy: (editor: Editor) => void,
}

const EditorDestroy = (): IEditorDestroy => {
	const Destroy = (editor: Editor) => {
		editor.Frame.Root.remove();
	};

	return {
		Destroy
	};
};

export default EditorDestroy();