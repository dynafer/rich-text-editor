import Editor from '../../Editor';
import { ArrowUpEvent, ArrowDownEvent, ArrowLeftEvent, ArrowRightEvent } from './Arrows';
import DefaultEvent from './Default';

enum EKeyEventName {
	keydown = 'keydown',
	keyup = 'keyup',
	keypress = 'keypress',
}

enum EKeyCode {
	ArrowUp = 'ArrowUp',
	ArrowDown = 'ArrowDown',
	ArrowLeft = 'ArrowLeft',
	ArrowRight = 'ArrowRight',
	Backspace = 'Backspace',
	Delete = 'Delete',
}

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

	setup(EKeyEventName.keyup, EKeyCode.ArrowUp, ArrowUpEvent);
	setup(EKeyEventName.keyup, EKeyCode.ArrowDown, ArrowDownEvent);
	setup(EKeyEventName.keyup, EKeyCode.ArrowLeft, ArrowLeftEvent);
	setup(EKeyEventName.keyup, EKeyCode.ArrowRight, ArrowRightEvent);
};

export default Keyboard;