import Keyboard from 'finer/packages/events/keyboard/Keyboard';
import Editor from 'finer/packages/Editor';

const EventSetup = (editor: Editor) => {
	Keyboard(editor);
};

export default EventSetup;