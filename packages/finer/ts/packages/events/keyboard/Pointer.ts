import Editor from '../../Editor';

const PointerEvent = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;
	self.Dispatch('caret:change', event.composedPath());
};

export default PointerEvent;