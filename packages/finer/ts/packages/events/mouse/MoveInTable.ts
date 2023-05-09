import Options from '../../../Options';
import Editor from '../../Editor';
import { CreateAdjustableLineSize } from '../../tools/parts/Utils';

const MoveInTable = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;

	if (self.IsAdjusting()) return;

	const target = event.target as Element;

	const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(target);
	if (!Figure || !FigureElement || !DOM.Element.Table.Is(FigureElement)) return;

	const targetCell = DOM.Element.Table.FindClosestCell<HTMLElement>(target);
	if (!targetCell) return;

	const selectAdjustable = (type: 'width' | 'height'): HTMLElement => {
		const attrs: Record<string, string> = {};
		attrs[Options.ATTRIBUTES.ADJUSTABLE_LINE] = type;
		return DOM.Select<HTMLElement>({ attrs }, Figure);
	};

	const adjustableWidth = selectAdjustable('width');
	const adjustableHeight = selectAdjustable('height');

	const bTargetHelper = target === adjustableWidth || target === adjustableHeight;
	if (bTargetHelper) return;

	const { pageX, pageY } = event;

	const left = FigureElement.offsetLeft + targetCell.offsetLeft;
	const top = FigureElement.offsetTop + targetCell.offsetTop;

	const leftWithFigure = Figure.offsetLeft + left;
	const topWithFigure = Figure.offsetTop + top;

	if (pageX - leftWithFigure <= targetCell.offsetWidth / 2) {
		DOM.SetStyle(adjustableWidth, 'left', CreateAdjustableLineSize(left, true));
	} else if (pageX - leftWithFigure > targetCell.offsetWidth / 2) {
		DOM.SetStyle(adjustableWidth, 'left', CreateAdjustableLineSize(left + targetCell.offsetWidth, true));
	}

	if (pageY - topWithFigure <= targetCell.offsetHeight / 2) {
		DOM.SetStyle(adjustableHeight, 'top', CreateAdjustableLineSize(top, true));
	} else if (pageY - topWithFigure > targetCell.offsetHeight / 2) {
		DOM.SetStyle(adjustableHeight, 'top', CreateAdjustableLineSize(top + targetCell.offsetHeight, true));
	}
};

export default MoveInTable;