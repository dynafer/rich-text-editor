import Editor from '../Editor';
import Keyboard from './keyboard/Keyboard';
import Mouse from './mouse/Mouse';

const EventSetup = (editor: Editor) => {
	Keyboard(editor);
	Mouse(editor);
};

export default EventSetup;