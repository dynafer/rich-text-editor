import Editor from 'finer/packages/Editor';
import ClickEvent from 'finer/packages/events/mouse/Click';

enum EMouseEventName {
	click = 'click'
}

const Keyboard = (editor: Editor) => {
	const setup = (eventName: EMouseEventName, event: (editor: Editor, event: MouseEvent) => void) => {
		editor.On(eventName, (mouseEvent: MouseEvent) => {
			event(editor, mouseEvent);
		});
	};

	setup(EMouseEventName.click, ClickEvent);
};

export default Keyboard;