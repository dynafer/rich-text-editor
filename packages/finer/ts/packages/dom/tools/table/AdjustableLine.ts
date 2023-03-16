import { Arr } from '@dynafer/utils';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { TableCellSelector } from '../../../formatter/Format';
import { ADJUSTABLE_LINE_HALF_SIZE, CreateAdjustableLineSize, CreateCurrentPoint, CreateFakeTable, GetClientSize, GetTableGridWithIndex, ITableGrid, MoveToCurrentPoint } from './TableToolsUtils';

interface IAdjustableLine {
	BoundEvents: [ENativeEvents, EventListener],
	Element: HTMLElement,
}

const AdjustableLine = (editor: Editor, table: HTMLElement, tableGrid: ITableGrid): IAdjustableLine => {
	const self = editor;
	const DOM = self.DOM;
	const TableTools = self.Tools.DOM.Table;

	const adjustableLineGroup = DOM.Create('div', {
		attrs: {
			dataAdjustableLineGroup: '',
		},
	});

	const createAdjustableLine = (type: 'width' | 'height'): HTMLElement =>
		DOM.Create('div', {
			attrs: {
				dataAdjustableLine: type,
			},
			styles: {
				width: `${type === 'width' ? ADJUSTABLE_LINE_HALF_SIZE * 2 - 1 : GetClientSize(self, table, 'width')}px`,
				height: `${type === 'width' ? GetClientSize(self, table, 'height') : ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`,
				left: `${type === 'width' ? 0 : table.offsetLeft}px`,
				top: `${type === 'width' ? table.offsetTop : 0}px`,
			}
		});

	const adjustableWidth = createAdjustableLine('width');
	const adjustableHeight = createAdjustableLine('height');

	const setAdjustableSize = () => {
		DOM.SetStyles(adjustableWidth, {
			width: `${ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`,
			height: `${GetClientSize(self, table, 'height')}px`,
		});
		DOM.SetStyles(adjustableHeight, {
			width: `${GetClientSize(self, table, 'width')}px`,
			height: `${ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`,
		});
	};

	const startAdjusting = (event: MouseEvent) => {
		PreventEvent(event);

		let savedPoint = CreateCurrentPoint(self, table);

		const moveToSavedPoint = () => {
			MoveToCurrentPoint(self, table, savedPoint);
			savedPoint = undefined;
		};

		const boundEvents: [boolean, HTMLElement, ENativeEvents, EventListener][] = [];

		const removeEvents = () => {
			for (const boundEvent of boundEvents) {
				const off = boundEvent[0] ? self.GetRootDOM().Off : DOM.Off;
				off(boundEvent[1], boundEvent[2], boundEvent[3]);
			}
		};

		setAdjustableSize();

		const bWidth = event.target === adjustableWidth;

		const adjustItem = bWidth ? adjustableWidth : adjustableHeight;
		let startOffset = bWidth ? event.clientX : event.clientY;

		DOM.SetAttr(adjustItem, 'data-adjusting', '');

		const fakeTable = CreateFakeTable(self, table);
		DOM.Insert(adjustableLineGroup, fakeTable);

		const fakeTableGrid = GetTableGridWithIndex(self, fakeTable);

		const sizeStyleName = bWidth ? 'width' : 'height';
		const positionStyleName = bWidth ? 'left' : 'top';

		const getPosition = (element: HTMLElement): number => bWidth ? element.offsetLeft : element.offsetTop;

		const getMinimumSize = (cell: HTMLElement): number => {
			DOM.SetStyles(fakeTable, {
				width: '0px',
				height: '0px',
			});

			if (!bWidth) {
				let sibling: HTMLElement | null = cell.nextElementSibling as HTMLElement;
				while (sibling) {
					DOM.SetAttr(sibling, 'dump-height', DOM.GetStyle(sibling, 'height'));
					DOM.RemoveStyle(sibling, 'height');
					sibling = sibling.nextElementSibling as HTMLElement;
				}
			}

			const currentSize = DOM.GetStyle(cell, sizeStyleName);
			DOM.SetStyle(cell, sizeStyleName, '0px');
			const size = GetClientSize(self, cell, sizeStyleName);
			DOM.SetStyle(cell, sizeStyleName, currentSize);

			if (!bWidth) {
				let sibling: HTMLElement | null = cell.nextElementSibling as HTMLElement;
				while (sibling) {
					DOM.SetStyle(sibling, 'height', DOM.GetAttr(sibling, 'dump-height') ?? '');
					DOM.RemoveAttr(sibling, 'dump-height');
					sibling = sibling.nextElementSibling as HTMLElement;
				}
			}

			DOM.SetStyles(fakeTable, {
				width: `${table.offsetWidth}px`,
				height: `${table.offsetHeight}px`,
			});

			return size;
		};

		const adjustableCells: HTMLElement[] = [];
		const nextAdjustableCells: HTMLElement[] = [];

		let minimumSize = -1;
		let minimumDifference = -1;
		let nextMinimumSize = -1;
		let nextMinimumDifference = -1;

		for (let rowIndex = 0, rowLength = fakeTableGrid.Grid.length; rowIndex < rowLength; ++rowIndex) {
			const row = fakeTableGrid.Grid[rowIndex];

			for (let cellIndex = 0, cellLength = row.length; cellIndex < cellLength; ++cellIndex) {
				const cell = row[cellIndex];
				const cellPosition = getPosition(table) + getPosition(cell);
				const adjustablePosition = getPosition(adjustItem);
				const adjustableAddableSize = ADJUSTABLE_LINE_HALF_SIZE * 1.5;

				const adjustableLeft = adjustablePosition - adjustableAddableSize;
				const adjustableRight = adjustablePosition + adjustableAddableSize;

				DOM.SetStyle(cell, sizeStyleName, `${GetClientSize(self, cell, sizeStyleName)}px`);

				if (cellPosition >= adjustableLeft && cellPosition <= adjustableRight) {
					Arr.Push(nextAdjustableCells, cell);
					if (nextMinimumSize !== -1) continue;

					nextMinimumSize = getMinimumSize(cell);
					nextMinimumDifference = GetClientSize(self, cell, sizeStyleName) - nextMinimumSize;
					continue;
				}

				const cellRightPosition = cellPosition + GetClientSize(self, cell, sizeStyleName);

				if (cellRightPosition >= adjustableLeft && cellRightPosition <= adjustableRight) {
					Arr.Push(adjustableCells, cell);
					if (minimumSize !== -1) continue;

					minimumSize = getMinimumSize(cell);
					minimumDifference = GetClientSize(self, cell, sizeStyleName) - minimumSize;
					continue;
				}
			}
		}

		const commonFinishAdjusting = () => {
			removeEvents();

			DOM.Remove(fakeTable);
			DOM.RemoveAttr(adjustItem, 'data-adjusting');

			TableTools.ChangePositions();

			moveToSavedPoint();
		};

		const bLeftTop = !Arr.IsEmpty(nextAdjustableCells);
		const bRightBottom = !Arr.IsEmpty(adjustableCells);

		if (!bLeftTop && !bRightBottom) return commonFinishAdjusting();

		let savedAdjustPosition = -1;
		let savedAdjustRightPosition = -1;
		let lastAdjustPosition = -1;

		let savedTableSize = -1;
		let savedTablePosition = -1;

		if (bLeftTop && !bRightBottom) {
			savedAdjustPosition = getPosition(fakeTable) + nextMinimumDifference - ADJUSTABLE_LINE_HALF_SIZE;
			savedTableSize = GetClientSize(self, fakeTable, sizeStyleName) - nextMinimumDifference;
			savedTablePosition = getPosition(fakeTable) + nextMinimumDifference;
		}

		if (!bLeftTop && bRightBottom) {
			savedAdjustPosition = getPosition(fakeTable) + GetClientSize(self, fakeTable, sizeStyleName) - minimumDifference - ADJUSTABLE_LINE_HALF_SIZE;
			savedTableSize = GetClientSize(self, fakeTable, sizeStyleName) - minimumDifference;
			savedTablePosition = getPosition(fakeTable);
		}

		if (bLeftTop && bRightBottom) {
			savedAdjustPosition = getPosition(fakeTable) + getPosition(adjustableCells[0]) + minimumSize - ADJUSTABLE_LINE_HALF_SIZE;
			savedAdjustRightPosition = getPosition(fakeTable) + getPosition(nextAdjustableCells[0])
				+ GetClientSize(self, nextAdjustableCells[0], sizeStyleName) - nextMinimumSize - ADJUSTABLE_LINE_HALF_SIZE;
		}

		const setSavedTableSize = (cells: HTMLElement[]) => {
			const newStyles: Record<string, string> = {};
			newStyles[sizeStyleName] = `${savedTableSize}px`;
			newStyles[positionStyleName] = `${savedTablePosition}px`;
			DOM.SetStyles(fakeTable, newStyles);

			for (const cell of cells) {
				DOM.SetStyle(cell, sizeStyleName, `${GetClientSize(self, cell, sizeStyleName)}px`);
			}
		};

		const adjust = (e: MouseEvent) => {
			PreventEvent(e);

			const currentOffset = bWidth ? e.clientX : e.clientY;
			const calculated = currentOffset - startOffset;

			if (calculated === 0) return;

			const adjustPosition = getPosition(adjustItem) + calculated;
			DOM.SetStyle(adjustItem, positionStyleName, `${adjustPosition}px`);
			const changedAdjustPosition = getPosition(adjustItem);
			const middleAdjustItemPosition = changedAdjustPosition + ADJUSTABLE_LINE_HALF_SIZE;

			const tablePosition = parseFloat(DOM.GetStyle(fakeTable, positionStyleName));

			startOffset = currentOffset;

			if (bLeftTop && bRightBottom) {
				const sizeBeforeChanging = Math.floor(GetClientSize(self, adjustableCells[0], sizeStyleName));
				const nextSizeBeforeChanging = Math.floor(GetClientSize(self, nextAdjustableCells[0], sizeStyleName));

				const bCellMinimum = sizeBeforeChanging <= minimumSize;
				const bNextCellMinimum = nextSizeBeforeChanging <= nextMinimumSize;

				const multiplier = bCellMinimum ? 1 : -1;
				const multipliedCalculated = calculated * multiplier;

				if ((bCellMinimum || bNextCellMinimum) && multipliedCalculated < 0 && lastAdjustPosition === -1) {
					lastAdjustPosition = bCellMinimum ? savedAdjustPosition : savedAdjustRightPosition;
					return;
				}

				if (lastAdjustPosition !== -1) {
					const positionSizeComparison = (lastAdjustPosition - changedAdjustPosition) * multiplier;
					if (multipliedCalculated < 0 || positionSizeComparison > 0) return;
					lastAdjustPosition = -1;
				}

				const adjustableSizes: string[] = [];
				const nextAdjustableSizes: string[] = [];

				for (const cell of adjustableCells) {
					const cellSize = parseFloat(DOM.GetStyle(cell, sizeStyleName));
					const cellRightPosition = cellSize + tablePosition + getPosition(cell);
					const positionDifference = middleAdjustItemPosition - cellRightPosition;
					Arr.Push(adjustableSizes, `${cellSize + positionDifference}px`);
				}

				for (const cell of nextAdjustableCells) {
					const cellSize = parseFloat(DOM.GetStyle(cell, sizeStyleName));
					const cellLeftPosition = tablePosition + getPosition(cell);
					const positionDifference = cellLeftPosition - middleAdjustItemPosition;
					Arr.Push(nextAdjustableSizes, `${cellSize + positionDifference}px`);
				}

				for (let index = 0, length = adjustableCells.length; index < length; ++index) {
					DOM.SetStyle(adjustableCells[index], sizeStyleName, adjustableSizes[index]);
				}

				for (let index = 0, length = nextAdjustableCells.length; index < length; ++index) {
					DOM.SetStyle(nextAdjustableCells[index], sizeStyleName, nextAdjustableSizes[index]);
				}
				return;
			}

			const cells = bLeftTop ? nextAdjustableCells : adjustableCells;
			const sizeBeforeChanging = Math.floor(GetClientSize(self, cells[0], sizeStyleName));
			const tableSize = parseFloat(DOM.GetStyle(fakeTable, sizeStyleName));
			const minimum = bLeftTop ? nextMinimumSize : minimumSize;

			const multiplier = bLeftTop ? 1 : -1;
			const multipliedCalculated = calculated * multiplier;

			const bLastPosition = (sizeBeforeChanging <= minimum) || (bLeftTop ? false : tableSize <= savedTableSize);

			if (bLastPosition && multipliedCalculated > 0 && lastAdjustPosition === -1) {
				lastAdjustPosition = savedAdjustPosition;

				return setSavedTableSize(cells);
			}

			if (lastAdjustPosition !== -1) {
				if (GetClientSize(self, fakeTable, sizeStyleName) !== savedTableSize || getPosition(fakeTable) !== savedTablePosition)
					setSavedTableSize(cells);

				const positionSizeComparison = (lastAdjustPosition - changedAdjustPosition) * multiplier;
				if (multipliedCalculated > 0 || positionSizeComparison < 0) return;
				lastAdjustPosition = -1;
			}

			const positionDifference = (tablePosition + (bLeftTop ? 0 : tableSize) - middleAdjustItemPosition) * multiplier;

			const cellSizes: number[] = [];
			for (const cell of cells) {
				Arr.Push(cellSizes, GetClientSize(self, cell, sizeStyleName));
			}

			for (let index = 0, length = cells.length; index < length; ++index) {
				DOM.SetStyle(cells[index], sizeStyleName, `${cellSizes[index] + positionDifference}px`);
			}

			const newStyles: Record<string, string> = {};
			newStyles[sizeStyleName] = `${tableSize + positionDifference}px`;
			if (bLeftTop) newStyles[positionStyleName] = `${tablePosition - positionDifference}px`;

			DOM.SetStyles(fakeTable, newStyles);
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);

			for (let rowIndex = 0, rowLength = fakeTableGrid.Grid.length; rowIndex < rowLength; ++rowIndex) {
				const row = fakeTableGrid.Grid[rowIndex];

				for (let cellIndex = 0, cellLength = row.length; cellIndex < cellLength; ++cellIndex) {
					const column = row[cellIndex];
					const size = DOM.GetStyle(column, sizeStyleName);
					DOM.SetStyle(tableGrid.Grid[rowIndex][cellIndex], sizeStyleName, size);
				}
			}

			commonFinishAdjusting();
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

		setAdjustableSize();

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
		BoundEvents: [ENativeEvents.mousemove, mouseMoveInTable as EventListener],
		Element: adjustableLineGroup,
	};
};

export default AdjustableLine;