import Editor from '../../Editor';
import { ENativeEvents, Setup } from '../EventSetupUtils';
import DragFigure from './DragFigure';

const Drag = (editor: Editor) => {
	const self = editor;

	Setup(self, ENativeEvents.dragstart, DragFigure);
};

export default Drag;