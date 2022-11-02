import Editor from '../../Editor';

const MouseUpEvent = (editor: Editor, event: MouseEvent) => {
	editor.Dispatch('caret:change', event.composedPath());
};

export default MouseUpEvent;