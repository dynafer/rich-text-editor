import Editor from '../../Editor';
import DefaultEvent from './Default';
import PointerEvent from './Pointer';
import { EKeyCode, EKeyEventName } from './KeyboardUtils';

const Keyboard = (editor: Editor) => {
	const setup = (eventName: EKeyEventName, keyCode: EKeyCode, event: (editor: Editor, event: KeyboardEvent) => void) => {
		editor.On(eventName, (keyEvent: KeyboardEvent) => {
			if (keyEvent.key === keyCode) {
				event(editor, keyEvent);
			}
		});
	};

	editor.On(EKeyEventName.keyup, (event: KeyboardEvent) => DefaultEvent(editor, event));
	editor.On(EKeyEventName.keypress, (event: KeyboardEvent) => DefaultEvent(editor, event));
	editor.On(EKeyEventName.keydown, (event: KeyboardEvent) => DefaultEvent(editor, event));

	setup(EKeyEventName.keyup, EKeyCode.ArrowUp, PointerEvent);
	setup(EKeyEventName.keyup, EKeyCode.ArrowDown, PointerEvent);
	setup(EKeyEventName.keyup, EKeyCode.ArrowLeft, PointerEvent);
	setup(EKeyEventName.keyup, EKeyCode.ArrowRight, PointerEvent);
	setup(EKeyEventName.keyup, EKeyCode.Home, PointerEvent);
	setup(EKeyEventName.keyup, EKeyCode.End, PointerEvent);
	setup(EKeyEventName.keyup, EKeyCode.PageDown, PointerEvent);
	setup(EKeyEventName.keyup, EKeyCode.PageUp, PointerEvent);
};

export default Keyboard;