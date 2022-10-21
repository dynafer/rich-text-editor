import Editor from 'finer/packages/Editor';

const ArrowUpEvent = (editor: Editor) => {
	const self = editor;
	const currentPosition = self.Utils.Caret.Get();

	editor.Utils.Event.Dispatch('caret:change', 'key', currentPosition);
};

const ArrowDownEvent = (editor: Editor) => {
	const self = editor;
	const currentPosition = self.Utils.Caret.Get();

	editor.Utils.Event.Dispatch('caret:change', 'key', currentPosition);
};

const ArrowLeftEvent = (editor: Editor) => {
	const self = editor;
	const currentPosition = self.Utils.Caret.Get();

	editor.Utils.Event.Dispatch('caret:change', 'key', currentPosition);
};

const ArrowRightEvent = (editor: Editor) => {
	const self = editor;
	const currentPosition = self.Utils.Caret.Get();

	editor.Utils.Event.Dispatch('caret:change', 'key', currentPosition);
};

export {
	ArrowUpEvent,
	ArrowDownEvent,
	ArrowLeftEvent,
	ArrowRightEvent,
};