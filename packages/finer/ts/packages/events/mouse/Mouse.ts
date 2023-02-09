import Editor from '../../Editor';
import { CaretChangeEvent, ENativeEvents, Setup } from '../EventSetupUtils';
import HoverTable from './HoverTable';
import SelectTableCell from './SelectTableCell';

const Mouse = (editor: Editor) => {
	const self = editor;

	Setup(self, ENativeEvents.mouseup, CaretChangeEvent);
	Setup(self, ENativeEvents.mousedown, SelectTableCell);
	Setup(self, ENativeEvents.mousemove, HoverTable);
};

export default Mouse;