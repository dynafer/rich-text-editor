import Editor from '../../Editor';
import { ENativeEvents, Setup } from '../EventSetupUtils';
import DragImage from './DragImage';

const Drag = (editor: Editor) => {
	const self = editor;

	Setup(self, ENativeEvents.dragstart, DragImage);
};

export default Drag;