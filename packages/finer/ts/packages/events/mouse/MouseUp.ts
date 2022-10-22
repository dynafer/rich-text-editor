import Editor from 'finer/packages/Editor';

const MouseUpEvent = (editor: Editor) => {
	const self = editor;
	const carets = self.Utils.Caret.Get();

	editor.Dispatch('caret:change', carets);
};

export default MouseUpEvent;