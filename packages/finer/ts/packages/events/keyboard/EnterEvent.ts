import Editor from '../../Editor';
import { PreventEvent } from '../EventSetupUtils';
import { EKeyCode } from './KeyboardUtils';

const EnterEvent = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	if (event.key !== EKeyCode.Enter && event.code !== EKeyCode.Enter) return;

	const caret = CaretUtils.Get()[0];
	if (!caret || caret.IsRange()) return CaretUtils.Clean();

	if (!DOM.Element.Figure.IsFigure(caret.Start.Node)) return CaretUtils.Clean();

	const figure = caret.Start.Node;
	if (!figure) return CaretUtils.Clean();

	PreventEvent(event);

	const bPrevious = caret.Start.Offset === 0;
	const toggle = bPrevious ? DOM.InsertBefore : DOM.InsertAfter;
	const newParagraph = self.CreateEmptyParagraph();

	toggle(figure, newParagraph);

	if (bPrevious) return CaretUtils.Clean();

	const newRange = self.Utils.Range();
	newRange.SetStartToEnd(DOM.Utils.GetFirstChild(newParagraph), 0, 0);
	CaretUtils.UpdateRanges(newRange);

	self.Tools.DOM.ChangePositions();
	self.Utils.Shared.DispatchCaretChange([newParagraph]);
};

export default EnterEvent;