import Editor from '../../Editor';
import MouseUpEvent from './MouseUp';
import { EMouseEventName } from './MouseUtils';

const Mouse = (editor: Editor) => {
	const setup = (eventName: EMouseEventName, event: (editor: Editor, event: MouseEvent) => void) => {
		editor.On(eventName, (mouseEvent: MouseEvent) => {
			event(editor, mouseEvent);
		});
	};

	setup(EMouseEventName.mouseup, MouseUpEvent);
};

export default Mouse;