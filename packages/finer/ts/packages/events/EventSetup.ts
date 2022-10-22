import Editor from 'finer/packages/Editor';
import Keyboard from 'finer/packages/events/keyboard/Keyboard';
import Mouse from 'finer/packages/events/mouse/Mouse';

const EventSetup = (editor: Editor) => {
	Keyboard(editor);
	Mouse(editor);
};

export default EventSetup;