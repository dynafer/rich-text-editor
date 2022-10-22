import Editor from 'finer/packages/Editor';

const ArrowUpEvent = (editor: Editor) => {
	const self = editor;
	const carets = self.Utils.Caret.Get();

	editor.Dispatch('caret:change', carets);
};

const ArrowDownEvent = (editor: Editor) => {
	const self = editor;
	const carets = self.Utils.Caret.Get();

	editor.Dispatch('caret:change', carets);
};

const ArrowLeftEvent = (editor: Editor) => {
	const self = editor;
	const carets = self.Utils.Caret.Get();

	editor.Dispatch('caret:change', carets);
};

const ArrowRightEvent = (editor: Editor) => {
	const self = editor;
	const carets = self.Utils.Caret.Get();

	editor.Dispatch('caret:change', carets);
};

export {
	ArrowUpEvent,
	ArrowDownEvent,
	ArrowLeftEvent,
	ArrowRightEvent,
};