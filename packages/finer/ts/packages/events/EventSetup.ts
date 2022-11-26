import Editor from '../Editor';
import Keyboard from './keyboard/Keyboard';
import Mouse from './mouse/Mouse';
import Update from './update/Update';

const EventSetup = (editor: Editor) => {
	Keyboard(editor);
	Mouse(editor);
	Update(editor);
};

export default EventSetup;