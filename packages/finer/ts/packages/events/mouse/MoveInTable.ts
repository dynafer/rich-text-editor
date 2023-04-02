import { CreateAdjustableLineSize } from '../../dom/tools/Utils';
import Editor from '../../Editor';

const MoveInTable = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;

	if (self.IsAdjusting()) return;

	const target = event.target as Element;

	const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(target);
	if (!Figure || !FigureElement || !DOM.Element.Table.IsTable(FigureElement)) return;

	const targetCell = DOM.Element.Table.GetClosestCell<HTMLElement>(target);
	if (!targetCell) return;

	const selectAdjustable = (type: 'width' | 'height'): HTMLElement => DOM.Select<HTMLElement>({
		attrs: {
			dataAdjustableLine: type
		}
	}, Figure);

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