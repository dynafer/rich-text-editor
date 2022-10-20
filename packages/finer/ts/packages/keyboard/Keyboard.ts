import Editor from 'finer/packages/Editor';
import EnterEvent from 'finer/packages/keyboard/Enter';

enum EKeyCode {
	Enter = 'Enter',
}

const setup = (editor: Editor, keyCode: EKeyCode, event: (editor: Editor, event: KeyboardEvent) => void) => {
	editor.On('keydown', (keyEvent: KeyboardEvent) => {
		if (keyEvent.code === keyCode) {
			event(editor, keyEvent);
		}
	});
};

const Keyboard = (editor: Editor) => {
	setup(editor, EKeyCode.Enter, EnterEvent);
};

export default Keyboard;