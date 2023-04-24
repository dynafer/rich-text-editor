import { NodeType } from '@dynafer/dom-control';
import { Str } from '@dynafer/utils';
import Editor from '../../Editor';
import { IsFigure } from './KeyboardUtils';

const Backspace = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const lines = self.GetLines(false);
	const caret = CaretUtils.Get();
	if (!caret) return;

	const currentLine = caret.Start.Path[0];

	if (lines[lines.length - 1] !== currentLine
		|| !Str.IsEmpty(DOM.GetText(currentLine))
		|| IsFigure(self, currentLine)) return;

	DOM.Remove(currentLine);

	let lastChild: Node | null = DOM.Utils.GetLastChild(lines[lines.length - 1], true);
	if (DOM.Utils.IsBr(lastChild)) lastChild = lastChild.parentNode;

	if (!lastChild) return;

	const newRange = self.Utils.Range();

	const index = NodeType.IsText(lastChild) ? lastChild.length : 0;
	newRange.SetStartToEnd(lastChild, index, index);

	CaretUtils.UpdateRange(newRange);
};

export default Backspace;