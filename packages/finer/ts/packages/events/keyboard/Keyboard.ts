import Editor from 'finer/packages/Editor';
import EnterEvent from 'finer/packages/events/keyboard/Enter';
import { ArrowUpEvent, ArrowDownEvent, ArrowLeftEvent, ArrowRightEvent } from 'finer/packages/events/keyboard/Arrows';

enum EKeyCode {
	Enter = 'Enter',
	ArrowUp = 'ArrowUp',
	ArrowDown = 'ArrowDown',
	ArrowLeft = 'ArrowLeft',
	ArrowRight = 'ArrowRight',
}

enum EKeyEventName {
	keydown = 'keydown',
	keyup = 'keyup'
}

const Keyboard = (editor: Editor) => {
	const setup = (eventName: EKeyEventName, keyCode: EKeyCode, event: (editor: Editor, event: KeyboardEvent) => void) => {
		editor.On(eventName, (keyEvent: KeyboardEvent) => {
			if (keyEvent.key === keyCode) {
				event(editor, keyEvent);
			}
		});
	};

	setup(EKeyEventName.keydown, EKeyCode.Enter, EnterEvent);
	setup(EKeyEventName.keyup, EKeyCode.ArrowUp, ArrowUpEvent);
	setup(EKeyEventName.keyup, EKeyCode.ArrowDown, ArrowDownEvent);
	setup(EKeyEventName.keyup, EKeyCode.ArrowLeft, ArrowLeftEvent);
	setup(EKeyEventName.keyup, EKeyCode.ArrowRight, ArrowRightEvent);
};

export default Keyboard;