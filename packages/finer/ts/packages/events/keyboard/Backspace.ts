import { NodeType } from '@dynafer/dom-control';
import Editor from '../../Editor';
import { IsTableFigure } from './KeyboardUtils';

const Backspace = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const lines = DOM.GetChildren(self.GetBody(), false);
	const caret = CaretUtils.Get()[0];
	if (!caret) return CaretUtils.Clean();

	const currentLine = caret.Start.Path[0];

	if (lines[lines.length - 1] !== currentLine
		|| !DOM.Utils.IsTextEmpty(currentLine)
		|| IsTableFigure(self, currentLine)) return CaretUtils.Clean();

	DOM.Remove(currentLine);

	let lastChild: Node | null = DOM.Utils.GetLastChild(lines[lines.length - 1], true);
	if (DOM.Utils.IsBr(lastChild)) lastChild = lastChild.parentNode;

	if (!lastChild) return CaretUtils.Clean();

	const newRange = self.Utils.Range();

	const index = NodeType.IsText(lastChild) ? lastChild.length : 0;
	newRange.SetStartToEnd(lastChild, index, index);

	CaretUtils.UpdateRanges(newRange);
};

export default Backspace;