import Editor from '../../Editor';
import Resize from './Resize';

const Root = (editor: Editor) => {
	const self = editor;

	Resize(self);
};

export default Root;