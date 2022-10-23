import Editor from '../../Editor';
import MouseUpEvent from './MouseUp';

enum EMouseEventName {
	mouseup = 'mouseup'
}

const Mouse = (editor: Editor) => {
	const setup = (eventName: EMouseEventName, event: (editor: Editor, event: MouseEvent) => void) => {
		editor.On(eventName, (mouseEvent: MouseEvent) => {
			event(editor, mouseEvent);
		});
	};

	setup(EMouseEventName.mouseup, MouseUpEvent);
};

export default Mouse;