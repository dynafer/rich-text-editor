import Editor from '../../Editor';

const ArrowUpEvent = (editor: Editor, event: KeyboardEvent) => {
	editor.Dispatch('caret:change', event.composedPath());
};

const ArrowDownEvent = (editor: Editor, event: KeyboardEvent) => {
	editor.Dispatch('caret:change', event.composedPath());
};

const ArrowLeftEvent = (editor: Editor, event: KeyboardEvent) => {
	editor.Dispatch('caret:change', event.composedPath());
};

const ArrowRightEvent = (editor: Editor, event: KeyboardEvent) => {
	editor.Dispatch('caret:change', event.composedPath());
};

export {
	ArrowUpEvent,
	ArrowDownEvent,
	ArrowLeftEvent,
	ArrowRightEvent,
};