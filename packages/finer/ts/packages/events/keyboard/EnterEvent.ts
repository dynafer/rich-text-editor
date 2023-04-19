import Editor from '../../Editor';
import { PreventEvent } from '../EventSetupUtils';
import { EKeyCode } from './KeyboardUtils';

const EnterEvent = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	if (event.key !== EKeyCode.Enter && event.code !== EKeyCode.Enter) return;

	const caret = CaretUtils.Get();
	if (!caret || caret.IsRange() || !DOM.Element.Figure.IsFigure(caret.Start.Node)) return;

	PreventEvent(event);

	const figure = caret.Start.Node;

	const bPrevious = caret.Start.Offset === 0;
	const toggle = bPrevious ? DOM.InsertBefore : DOM.InsertAfter;
	const newParagraph = self.CreateEmptyParagraph();

	toggle(figure, newParagraph);

	if (bPrevious) return;

	const newRange = self.Utils.Range();
	newRange.SetStartToEnd(DOM.Utils.GetFirstChild(newParagraph), 0, 0);
	CaretUtils.UpdateRange(newRange);

	self.Utils.Shared.DispatchCaretChange([newParagraph]);
};

export default EnterEvent;