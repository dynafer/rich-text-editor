import Editor from '../Editor';
import Custom from './custom/Custom';
import Drag from './drag/Drag';
import Keyboard from './keyboard/Keyboard';
import Mouse from './mouse/Mouse';
import Root from './root/Root';
import Update from './update/Update';

const EventSetup = (editor: Editor) => {
	const self = editor;

	Custom(self);
	Drag(self);
	Keyboard(self);
	Mouse(self);
	Update(self);
	Root(self);
};

export default EventSetup;