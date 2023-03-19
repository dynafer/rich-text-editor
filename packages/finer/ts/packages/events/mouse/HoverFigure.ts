import { Arr } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { FigureSelector } from '../../formatter/Format';

const HoverFigure = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const DOMTools = self.Tools.DOM;

	if (DOM.HasAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING)) return;

	const caret = self.Utils.Caret.Get()[0];
	if (caret?.IsRange()) {
		DOMTools.RemoveAll();
		return self.Utils.Caret.Clean();
	}

	self.Utils.Caret.Clean();

	const figure = DOM.Closest((event.composedPath()[0] ?? event.target) as Element, FigureSelector);
	const figureType = DOM.GetAttr(figure, 'type');
	if (!figure || !figureType) return DOMTools.RemoveAll();

	const figureElement = DOM.SelectAll(figureType, figure)[0];
	if (!figureElement) return DOMTools.RemoveAll();

	const tools = DOM.SelectAll({
		attrs: {
			dataFixed: 'dom-tool'
		}
	}, figure);

	if (tools.length >= 1) {
		let target: HTMLElement | undefined;
		Arr.Each(tools, tool => {
			if (DOM.Closest(tool, FigureSelector) !== figure) return;
			target = tool;
		});
		DOMTools.RemoveAll(target);
		if (target) return;
	}

	DOM.Insert(figure, DOMTools.Create(figureType, figureElement));
};

export default HoverFigure;