import Options from '../../../Options';
import Editor from '../../Editor';
import { FigureSelector } from '../../formatter/Format';

const ClickFigure = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const DOMTools = self.Tools.DOM;

	if (DOM.HasAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING) || !event.composedPath()[0]) return;

	const figure = DOM.Closest(event.composedPath()[0] as Element, FigureSelector);
	const figureType = DOM.GetAttr(figure, 'type');
	if (!figure || !figureType) return DOMTools.RemoveAll();

	if (figureType === 'img') {
		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(figure, 0, 0);
		self.Utils.Caret.UpdateRanges(newRange);
		self.Utils.Shared.DispatchCaretChange([figure]);
	}

	const figureElement = DOM.SelectAll(figureType, figure)[0];
	if (!figureElement) return DOMTools.RemoveAll();

	DOM.SetAttr(figure, Options.ATTRIBUTE_FOCUSED, '');

	const bHasTools = !!DOM.Select({
		attrs: {
			dataFixed: 'dom-tool'
		}
	}, figure);

	if (bHasTools) return;

	DOM.Insert(figure, DOMTools.Create(figureType, figureElement));
};

export default ClickFigure;