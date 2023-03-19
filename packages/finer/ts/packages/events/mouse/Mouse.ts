import Editor from '../../Editor';
import { CaretChangeEvent, ENativeEvents, Setup } from '../EventSetupUtils';
import ClickFigure from './ClickFigure';
import DoubleClick from './DoubleClick';
import HoverFigure from './HoverFigure';
import SelectTableCell from './SelectTableCell';

const Mouse = (editor: Editor) => {
	const self = editor;

	Setup(self, ENativeEvents.mouseup, CaretChangeEvent);
	Setup(self, ENativeEvents.mousedown, SelectTableCell);
	Setup(self, ENativeEvents.mousemove, HoverFigure);
	Setup(self, ENativeEvents.mouseup, ClickFigure);
	Setup(self, ENativeEvents.click, ClickFigure);
	Setup(self, ENativeEvents.dblclick, DoubleClick);
};

export default Mouse;