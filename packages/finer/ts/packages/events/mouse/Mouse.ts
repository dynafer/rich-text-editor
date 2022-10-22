import Editor from 'finer/packages/Editor';
import MouseUpEvent from 'finer/packages/events/mouse/MouseUp';

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