import { Arr } from '@dynafer/utils';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { ADJUSTABLE_LINE_HALF_SIZE, GetClientSize, RegisterAdjustingEvents } from '../Utils';
import { CreateCurrentPoint, CreateFakeTable, GetTableGridWithIndex, MoveToCurrentPoint } from './TableToolsUtils';

const AdjustableLine = (editor: Editor, table: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;

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

		setAdjustableSize();

		const bWidth = event.target === adjustableWidth;

		const adjustItem = bWidth ? adjustableWidth : adjustableHeight;

		const { FigureElement } = DOM.Element.Figure.Find<HTMLElement>(adjustItem);
		if (!FigureElement) return;

		let startOffset = bWidth ? event.clientX : event.clientY;

		DOM.SetAttr(adjustItem, 'data-adjusting', '');

		const tableGrid = GetTableGridWithIndex(self, FigureElement);

		const fakeTable = CreateFakeTable(self, FigureElement);
		DOM.Insert(adjustableLineGroup, fakeTable);

		const fakeTableGrid = GetTableGridWithIndex(self, fakeTable);

		const sizeStyleName = bWidth ? 'width' : 'height';
		const positionStyleName = bWidth ? 'left' : 'top';

		const getPosition = (element: HTMLElement): number => bWidth ? element.offsetLeft : element.offsetTop;

		const getMinimumSize = (cell: HTMLElement): number => {
			self.SaveScrollPosition();

			DOM.SetStyles(fakeTable, {
				width: '0px',
				height: '0px',
			});

			if (!bWidth) {
				let sibling = cell.nextElementSibling;
				while (sibling) {
					DOM.SetAttr(sibling, 'dump-height', DOM.GetStyle(sibling, 'height'));
					DOM.RemoveStyle(sibling, 'height');
					sibling = sibling.nextElementSibling;
				}
			}

			const currentSize = DOM.GetStyle(cell, sizeStyleName);
			DOM.SetStyle(cell, sizeStyleName, '0px');
			const size = GetClientSize(self, cell, sizeStyleName);
			DOM.SetStyle(cell, sizeStyleName, currentSize);

			if (!bWidth) {
				let sibling = cell.nextElementSibling;
				while (sibling) {
					DOM.SetStyle(sibling, 'height', DOM.GetAttr(sibling, 'dump-height') ?? '');
					DOM.RemoveAttr(sibling, 'dump-height');
					sibling = sibling.nextElementSibling;
				}
			}

			DOM.SetStyles(fakeTable, {
				width: `${FigureElement.offsetWidth}px`,
				height: `${FigureElement.offsetHeight}px`,
			});

			self.ScrollSavedPosition();

			return size;
		};

		const adjustableCells: HTMLElement[] = [];
		const nextAdjustableCells: HTMLElement[] = [];

		let minimumSize = -1;
		let minimumDifference = -1;
		let nextMinimumSize = -1;
		let nextMinimumDifference = -1;

		Arr.Each(fakeTableGrid.Grid, row =>
			Arr.Each(row, cell => {
				const cellPosition = getPosition(FigureElement) + getPosition(cell);
				const adjustablePosition = getPosition(adjustItem);
				const adjustableAddableSize = ADJUSTABLE_LINE_HALF_SIZE * 1.5;

				const adjustableLeft = adjustablePosition - adjustableAddableSize;
				const adjustableRight = adjustablePosition + adjustableAddableSize;

				DOM.SetStyle(cell, sizeStyleName, `${GetClientSize(self, cell, sizeStyleName)}px`);

				if (cellPosition >= adjustableLeft && cellPosition <= adjustableRight) {
					Arr.Push(nextAdjustableCells, cell);
					if (nextMinimumSize !== -1) return;

					nextMinimumSize = getMinimumSize(cell);
					nextMinimumDifference = GetClientSize(self, cell, sizeStyleName) - nextMinimumSize;
					return;
				}

				const cellRightPosition = cellPosition + GetClientSize(self, cell, sizeStyleName);

				if (cellRightPosition >= adjustableLeft && cellRightPosition <= adjustableRight) {
					Arr.Push(adjustableCells, cell);
					if (minimumSize !== -1) return;

					minimumSize = getMinimumSize(cell);
					minimumDifference = GetClientSize(self, cell, sizeStyleName) - minimumSize;
					return;
				}
			})
		);

		const commonFinishAdjusting = () => {
			DOM.Remove(fakeTable);
			DOM.RemoveAttr(adjustItem, 'data-adjusting');

			MoveToCurrentPoint(self, FigureElement, savedPoint);
			savedPoint = undefined;
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

			Arr.Each(cells, cell => DOM.SetStyle(cell, sizeStyleName, `${GetClientSize(self, cell, sizeStyleName)}px`));
		};

		const adjustMiddleCells = (calculated: number, adjustPosition: number, tablePosition: number) => {
			const middleAdjustItemPosition = adjustPosition + ADJUSTABLE_LINE_HALF_SIZE;

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
				const positionSizeComparison = (lastAdjustPosition - adjustPosition) * multiplier;
				if (multipliedCalculated < 0 || positionSizeComparison > 0) return;
				lastAdjustPosition = -1;
			}

			const adjustableSizes: [HTMLElement, string][] = [];
			const nextAdjustableSizes: [HTMLElement, string][] = [];

			Arr.Each(adjustableCells, cell => {
				const cellSize = parseFloat(DOM.GetStyle(cell, sizeStyleName));
				const cellRightPosition = cellSize + tablePosition + getPosition(cell);
				const positionDifference = middleAdjustItemPosition - cellRightPosition;
				Arr.Push(adjustableSizes, [cell, `${cellSize + positionDifference}px`]);
			});

			Arr.Each(nextAdjustableCells, cell => {
				const cellSize = parseFloat(DOM.GetStyle(cell, sizeStyleName));
				const cellLeftPosition = tablePosition + getPosition(cell);
				const positionDifference = cellLeftPosition - middleAdjustItemPosition;
				Arr.Push(nextAdjustableSizes, [cell, `${cellSize + positionDifference}px`]);
			});

			Arr.Each(adjustableSizes, ([cell, size]) => DOM.SetStyle(cell, sizeStyleName, size));
			Arr.Each(nextAdjustableSizes, ([cell, size]) => DOM.SetStyle(cell, sizeStyleName, size));
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

			if (bLeftTop && bRightBottom) return adjustMiddleCells(calculated, changedAdjustPosition, tablePosition);

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

			const cellSizes: [HTMLElement, number][] = [];
			Arr.Each(cells, cell => Arr.Push(cellSizes, [cell, GetClientSize(self, cell, sizeStyleName)]));

			Arr.Each(cellSizes, ([cell, size]) => DOM.SetStyle(cell, sizeStyleName, `${size + positionDifference}px`));

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

		RegisterAdjustingEvents(self, FigureElement, adjust, finishAdjusting);
	};

	DOM.On(adjustableWidth, ENativeEvents.mousedown, startAdjusting);
	DOM.On(adjustableHeight, ENativeEvents.mousedown, startAdjusting);

	DOM.Insert(adjustableLineGroup, adjustableWidth, adjustableHeight);

	return adjustableLineGroup;
};

export default AdjustableLine;