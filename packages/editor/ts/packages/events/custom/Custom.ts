import Editor from '../../Editor';
import CaretChange from './CaretChange';

const Custom = (editor: Editor) => {
	const self = editor;

	CaretChange(self);
};

export default Custom;