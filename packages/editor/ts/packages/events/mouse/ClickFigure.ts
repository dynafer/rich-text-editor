import Options from '../../../Options';
import Editor from '../../Editor';

const ClickFigure = (editor: Editor, event: MouseEvent | TouchEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const PartsTool = self.Tools.Parts;

	if (self.IsAdjusting() || !event.composedPath()[0]) return;

	const { Figure, FigureType, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(event.composedPath()[0]);
	if (!Figure || !FigureType || !FigureElement) return PartsTool.HideAll();

	if (FigureType !== 'table') {
		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(Figure, 0, 0);
		self.Utils.Caret.UpdateRange(newRange);
		self.Utils.Shared.DispatchCaretChange([Figure]);
	}

	DOM.SetAttr(Figure, Options.ATTRIBUTES.FOCUSED);
	PartsTool.ChangePositions();
};

export default ClickFigure;