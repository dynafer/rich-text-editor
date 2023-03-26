import Options from '../../../Options';
import { ADJUSTABLE_LINE_HALF_SIZE, CreateAdjustableLineSize } from '../../dom/tools/Utils';
import Editor from '../../Editor';

const MoveInTable = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;

	if (DOM.HasAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING)) return;

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

	const { offsetX, offsetY } = event;

	const left = FigureElement.offsetLeft + targetCell.offsetLeft;
	const top = FigureElement.offsetTop + targetCell.offsetTop;

	if (offsetX <= ADJUSTABLE_LINE_HALF_SIZE) {
		DOM.SetStyle(adjustableWidth, 'left', CreateAdjustableLineSize(left, true));
	} else if (offsetX >= targetCell.offsetWidth - ADJUSTABLE_LINE_HALF_SIZE) {
		DOM.SetStyle(adjustableWidth, 'left', CreateAdjustableLineSize(left + targetCell.offsetWidth, true));
	}

	if (offsetY <= ADJUSTABLE_LINE_HALF_SIZE) {
		DOM.SetStyle(adjustableHeight, 'top', CreateAdjustableLineSize(top, true));
	} else if (offsetY >= targetCell.offsetHeight - ADJUSTABLE_LINE_HALF_SIZE) {
		DOM.SetStyle(adjustableHeight, 'top', CreateAdjustableLineSize(top + targetCell.offsetHeight, true));
	}
};

export default MoveInTable;