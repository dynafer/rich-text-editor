import { Arr, Str } from '@dynafer/utils';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { TableCellSelector } from '../../../formatter/Format';
import Editor from '../../../Editor';
import { ADJUSTABLE_LINE_HALF_SIZE, CreateAdjustableLineSize, CreateFakeTable, GetTableGridWithIndex } from './TableToolsUtils';

interface IAdjustableLine {
	BoundEvents: [ENativeEvents, (event: Event) => void],
	Element: HTMLElement,
}

const AdjustableLine = (editor: Editor, table: HTMLElement): IAdjustableLine => {
	const self = editor;
	const DOM = self.DOM;

	const adjustableLineGroup = DOM.Create('div', {
		attrs: {
			dataAdjustableLineGroup: '',
		},
	});

	const createAdjustableLine = (type: 'width' | 'height') => DOM.Create('div', {
		attrs: {
			dataAdjustableLine: type,
		},
		styles: {
			width: `${type === 'width' ? ADJUSTABLE_LINE_HALF_SIZE * 2 - 1 : table.offsetWidth}px`,
			height: `${type === 'width' ? table.offsetHeight : ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`,
			left: `${type === 'width' ? 0 : table.offsetLeft}px`,
			top: `${type === 'width' ? table.offsetTop : 0}px`,
		},
	});

	const adjustableWidth = createAdjustableLine('width');
	const adjustableHeight = createAdjustableLine('height');

	const startAdjusting = (event: MouseEvent) => {
		PreventEvent(event);

		const bWidth = event.target === adjustableWidth;

		const adjustItem = bWidth ? adjustableWidth : adjustableHeight;

		DOM.SetAttr(adjustItem as Element, 'data-adjusting', '');

		let startOffset = bWidth ? event.clientX : event.clientY;

		const fakeTable = CreateFakeTable(self, table);
		DOM.Insert(adjustableLineGroup, fakeTable);

		DOM.SetStyles(fakeTable, {
			width: `${table.offsetWidth}px`,
			height: `${table.offsetHeight}px`,
		});

		const { TableGrid } = GetTableGridWithIndex(self, fakeTable);

		const adjustableCells: HTMLElement[] = [];
		const nextAdjustableCells: HTMLElement[] = [];

		let minimumSize = -1;
		let nextMinimumSize = -1;

		const getMinimumSize = (cell: HTMLElement): number => {
			const styleName = bWidth ? 'width' : 'height';

			const currentSize = DOM.GetStyle(cell, styleName);
			DOM.SetStyle(cell, styleName, '0px');
			const size = cell.offsetWidth;
			const toggleStyle = Str.IsEmpty(currentSize) ? DOM.RemoveStyle : DOM.SetStyle;
			toggleStyle(cell, styleName, currentSize);

			return size;
		};

		for (let rowIndex = 0, rowLength = TableGrid.length; rowIndex < rowLength; ++rowIndex) {
			const row = TableGrid[rowIndex];

			for (let cellIndex = 0, cellLength = row.length; cellIndex < cellLength; ++cellIndex) {
				const cell = row[cellIndex];
				const cellPosition = (bWidth ? table.offsetLeft : table.offsetTop) + (bWidth ? cell.offsetLeft : cell.offsetTop);
				const adjustablePosition = bWidth ? adjustItem.offsetLeft : adjustItem.offsetTop;
				const adjustableAddableSize = ADJUSTABLE_LINE_HALF_SIZE * 1.5;

				const adjustableLeft = adjustablePosition - adjustableAddableSize;
				const adjustableRight = adjustablePosition + adjustableAddableSize;

				if (cellPosition >= adjustableLeft && cellPosition <= adjustableRight) {
					Arr.Push(nextAdjustableCells, cell);
					if (nextMinimumSize !== -1) continue;

					nextMinimumSize = getMinimumSize(cell);
					continue;
				}

				const cellRightPosition = cellPosition + (bWidth ? cell.offsetWidth : cell.offsetHeight);

				if (cellRightPosition >= adjustableLeft && cellRightPosition <= adjustableRight) {
					Arr.Push(adjustableCells, cell);
					if (minimumSize !== -1) continue;

					minimumSize = getMinimumSize(cell);
					continue;
				}
			}
		}

		const boundEvents: [boolean, HTMLElement, ENativeEvents, (e: Event) => void][] = [];

		const removeEvents = () => {
			for (const boundEvent of boundEvents) {
				const off = boundEvent[0] ? self.GetRootDOM().Off : DOM.Off;
				off(boundEvent[1], boundEvent[2], boundEvent[3]);
			}
		};

		const commonFinishAdjusting = () => {
			removeEvents();

			DOM.Remove(fakeTable);

			DOM.RemoveAttr(adjustItem as Element, 'data-adjusting');
		};

		const bLeftTop = !Arr.IsEmpty(nextAdjustableCells);
		const bRightBottom = !Arr.IsEmpty(adjustableCells);

		if (!bLeftTop && !bRightBottom) return commonFinishAdjusting();

		const adjust = (e: MouseEvent) => {
			PreventEvent(e);

			const currentOffset = bWidth ? e.clientX : e.clientY;
			const calculated = currentOffset - startOffset;

			if (calculated === 0) return;

			const adjustPosition = (bWidth ? adjustItem.offsetLeft : adjustItem.offsetTop) + calculated;

			DOM.SetStyle(adjustItem, bWidth ? 'left' : 'top', Str.Merge(adjustPosition.toString(), 'px'));

			startOffset = currentOffset;

			if (bLeftTop && !bRightBottom) {
				// TODO: Adjust the most left or top cells
				return;
			}

			if (!bLeftTop && bRightBottom) {
				// TODO: Adjust the most right or bottom cells
				return;
			}

			// TODO: Adjust the middle of cells
			return;
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);
			commonFinishAdjusting();
			// TODO: Event after adjusting
		};

		Arr.Push(boundEvents,
			[false, self.GetBody(), ENativeEvents.mousemove, adjust],
			[false, self.GetBody(), ENativeEvents.mouseup, finishAdjusting],
			[true, self.GetRootDOM().GetRoot(), ENativeEvents.mousemove, finishAdjusting],
		);

		for (const boundEvent of boundEvents) {
			const on = boundEvent[0] ? self.GetRootDOM().On : DOM.On;
			on(boundEvent[1], boundEvent[2], boundEvent[3]);
		}
	};

	DOM.On(adjustableWidth, ENativeEvents.mousedown, startAdjusting);
	DOM.On(adjustableHeight, ENativeEvents.mousedown, startAdjusting);

	const mouseMoveInTable = (event: MouseEvent) => {
		if (DOM.HasAttr(adjustableWidth, 'data-adjusting') || DOM.HasAttr(adjustableHeight, 'data-adjusting')) return;

		const targetCell = DOM.Closest(event.target as Element, TableCellSelector) as HTMLElement;
		if ((!targetCell || !DOM.Utils.IsChildOf(targetCell, table)) && event.target !== adjustableWidth && event.target !== adjustableHeight) return;

		const bTargetHelper = event.target === adjustableWidth || event.target === adjustableHeight;

		const { offsetX, offsetY } = event;

		if (bTargetHelper) return;

		const left = table.offsetLeft + targetCell.offsetLeft;
		const top = table.offsetTop + targetCell.offsetTop;

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

	DOM.On(self.GetBody(), ENativeEvents.mousemove, mouseMoveInTable);

	DOM.Insert(adjustableLineGroup, adjustableWidth, adjustableHeight);

	return {
		BoundEvents: [ENativeEvents.mousemove, mouseMoveInTable as (event: Event) => void],
		Element: adjustableLineGroup,
	};
};

export default AdjustableLine;