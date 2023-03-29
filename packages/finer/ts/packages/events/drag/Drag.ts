import Editor from '../../Editor';
import { ENativeEvents, Setup } from '../EventSetupUtils';
import DragMedia from './DragMedia';

const Drag = (editor: Editor) => {
	const self = editor;

	Setup(self, ENativeEvents.dragstart, DragMedia);
};

export default Drag;