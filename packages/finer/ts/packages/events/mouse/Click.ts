import Editor from 'finer/packages/Editor';

const ClickEvent = (editor: Editor) => {
	const self = editor;
	const currentPosition = self.Utils.Caret.Get();

	editor.Utils.Event.Dispatch('caret:change', 'mouse', currentPosition);
};

export default ClickEvent;