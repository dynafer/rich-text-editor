import Editor from '../../Editor';
import { ENativeEvents, Setup } from '../EventSetupUtils';
import ClickFigure from './ClickFigure';
import HoverFigure from './HoverFigure';
import MoveInTable from './MoveInTable';
import SelectTableCell from './SelectTableCell';

const Mouse = (editor: Editor) => {
	const self = editor;
	const caretChangeEvent = () => self.Utils.Shared.DispatchCaretChange();

	Setup(self, ENativeEvents.mouseup, caretChangeEvent);
	Setup(self, ENativeEvents.touchend, caretChangeEvent);
	Setup(self, ENativeEvents.mousedown, SelectTableCell);
	Setup(self, ENativeEvents.touchstart, SelectTableCell);
	Setup(self, ENativeEvents.mousemove, HoverFigure);
	Setup(self, ENativeEvents.mousemove, MoveInTable);
	Setup(self, ENativeEvents.mouseup, ClickFigure);
	Setup(self, ENativeEvents.touchend, ClickFigure);
};

export default Mouse;