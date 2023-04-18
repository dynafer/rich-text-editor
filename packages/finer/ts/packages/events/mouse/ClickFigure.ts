import Options from '../../../Options';
import Editor from '../../Editor';

const ClickFigure = (editor: Editor, event: MouseEvent | TouchEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const DOMTools = self.Tools.DOM;

	if (self.IsAdjusting() || !event.composedPath()[0]) return;

	const { Figure, FigureType, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(event.composedPath()[0]);
	if (!Figure || !FigureType || !FigureElement) return DOMTools.HideAll();

	if (FigureType !== 'table') {
		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(Figure, 0, 0);
		self.Utils.Caret.UpdateRange(newRange);
		self.Utils.Shared.DispatchCaretChange([Figure]);
	}

	DOM.SetAttr(Figure, Options.ATTRIBUTE_FOCUSED);
	DOMTools.ChangePositions();
};

export default ClickFigure;