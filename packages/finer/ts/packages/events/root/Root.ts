import Editor from '../../Editor';
import Focus from './Focus';
import Resize from './Resize';

const Root = (editor: Editor) => {
	const self = editor;

	Resize(self);
	Focus(self);
};

export default Root;