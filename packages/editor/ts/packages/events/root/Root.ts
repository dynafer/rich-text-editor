import Editor from '../../Editor';
import Focus from './Focus';
import Resize from './Resize';
import Scroll from './Scroll';

const Root = (editor: Editor) => {
	const self = editor;

	Resize(self);
	Focus(self);
	Scroll(self);
};

export default Root;