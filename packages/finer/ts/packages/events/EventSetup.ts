import Editor from '../Editor';
import Custom from './ccustom/Custom';
import Keyboard from './keyboard/Keyboard';
import Mouse from './mouse/Mouse';
import Root from './root/Root';
import Update from './update/Update';

const EventSetup = (editor: Editor) => {
	Custom(editor);
	Keyboard(editor);
	Mouse(editor);
	Update(editor);
	Root(editor);
};

export default EventSetup;