import { Arr, Str } from '@dynafer/utils';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { TableCellSelector } from '../../../formatter/Format';
import Editor from '../../../Editor';
import { ADJUSTABLE_LINE_HALF_SIZE, CreateAdjustableLineSize, CreateCurrentPoint, CreateFakeTable, GetClientSize, GetTableGridWithIndex, MoveToCurrentPoint } from './TableToolsUtils';

interface IAdjustableLine {
	BoundEvents: [ENativeEvents, (event: Event) => void],
	Element: HTMLElement,
}

const AdjustableLine = (editor: Editor, table: HTMLElement): IAdjustableLine => {
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
				width: `${type === 'width' ? ADJUSTABLE_LINE_HALF_SIZE * 2 - 1 : GetClientSize(table, 'width')}px`,
				height: `${type === 'width' ? GetClientSize(table, 'height') : ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`,
				left: `${type === 'width' ? 0 : table.offsetLeft}px`,
				top: `${type === 'width' ? table.offsetTop : 0}px`,
			}
		});

	const adjustableWidth = createAdjustableLine('width');
	const adjustableHeight = createAdjustableLine('height');

	const setAdjustableSize = () => {
		DOM.SetStyles(adjustableWidth, {
			width: `${ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`,
			height: `${GetClientSize(table, 'height')}px`,
		});
		DOM.SetStyles(adjustableHeight, {
			width: `${GetClientSize(table, 'width')}px`,
			height: `${ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`,
		});
	};

	const tableGrid = GetTableGridWithIndex(self, table);

	const startAdjusting = (event: MouseEvent) => {
		PreventEvent(event);

		let savedPoint = CreateCurrentPoint(self, table);

		const moveToSavedPoint = () => {
			MoveToCurrentPoint(self, table, savedPoint);
			savedPoint = undefined;
		};

		const boundEvents: [boolean, HTMLElement, ENativeEvents, (e: Event) => void][] = [];

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

		DOM.SetAttr(adjustItem as Element, 'data-adjusting', '');

		const fakeTable = CreateFakeTable(self, table);
		DOM.Insert(adjustableLineGroup, fakeTable);

		const fakeTableGrid = GetTableGridWithIndex(self, fakeTable);

		const adjustableCells: HTMLElement[] = [];
		const nextAdjustableCells: HTMLElement[] = [];

		let minimumSize = -1;
		let nextMinimumSize = -1;

		const sizeStyleName = bWidth ? 'width' : 'height';
		const positionStyleName = bWidth ? 'left' : 'top';

		const getPosition = (element: HTMLElement): number => bWidth ? element.offsetLeft : element.offsetTop;

		const getMinimumSize = (cell: HTMLElement): number => {
			DOM.SetStyles(fakeTable, {
				width: '0px',
				height: '0px',
			});

			const currentSize = DOM.GetStyle(cell, sizeStyleName);
			DOM.SetStyle(cell, sizeStyleName, '0px');
			const size = GetClientSize(cell, sizeStyleName);
			DOM.SetStyle(cell, sizeStyleName, currentSize);

			DOM.SetStyles(fakeTable, {
				width: `${table.offsetWidth}px`,
				height: `${table.offsetHeight}px`,
			});

			return size;
		};

		for (let rowIndex = 0, rowLength = fakeTableGrid.TableGrid.length; rowIndex < rowLength; ++rowIndex) {
			const row = fakeTableGrid.TableGrid[rowIndex];

			for (let cellIndex = 0, cellLength = row.length; cellIndex < cellLength; ++cellIndex) {
				const cell = row[cellIndex];
				const cellPosition = getPosition(table) + getPosition(cell);
				const adjustablePosition = getPosition(adjustItem);
				const adjustableAddableSize = ADJUSTABLE_LINE_HALF_SIZE * 1.5;

				const adjustableLeft = adjustablePosition - adjustableAddableSize;
				const adjustableRight = adjustablePosition + adjustableAddableSize;

				DOM.SetStyle(cell, sizeStyleName, `${GetClientSize(cell, sizeStyleName)}px`);

				if (cellPosition >= adjustableLeft && cellPosition <= adjustableRight) {
					Arr.Push(nextAdjustableCells, cell);
					if (nextMinimumSize !== -1) continue;

					nextMinimumSize = getMinimumSize(cell);
					continue;
				}

				const cellRightPosition = cellPosition + GetClientSize(cell, sizeStyleName);

				if (cellRightPosition >= adjustableLeft && cellRightPosition <= adjustableRight) {
					Arr.Push(adjustableCells, cell);
					if (minimumSize !== -1) continue;

					minimumSize = getMinimumSize(cell);
					continue;
				}
			}
		}

		const commonFinishAdjusting = () => {
			removeEvents();

			DOM.Remove(fakeTable);

			DOM.RemoveAttr(adjustItem as Element, 'data-adjusting');

			TableTools.ChangePositions();

			moveToSavedPoint();
		};

		const bLeftTop = !Arr.IsEmpty(nextAdjustableCells);
		const bRightBottom = !Arr.IsEmpty(adjustableCells);

		if (!bLeftTop && !bRightBottom) return commonFinishAdjusting();

		let savedAdjustPosition = -1;
		let lastAdjustPosition = -1;

		let savedTableSize = -1;
		let savedTablePosition = -1;

		const setSavedTableSize = (cells: HTMLElement[]) => {
			const newStyles: Record<string, string> = {};
			newStyles[sizeStyleName] = `${savedTableSize}px`;
			newStyles[positionStyleName] = `${savedTablePosition}px`;
			DOM.SetStyles(fakeTable, newStyles);

			for (const cell of cells) {
				DOM.SetStyle(cell, sizeStyleName, '0px');
				DOM.SetStyle(cell, sizeStyleName, `${GetClientSize(cell, sizeStyleName)}px`);
			}
		};

		const adjust = (e: MouseEvent) => {
			PreventEvent(e);

			const currentOffset = bWidth ? e.clientX : e.clientY;
			const calculated = currentOffset - startOffset;

			if (calculated === 0) return;

			const adjustPosition = getPosition(adjustItem) + calculated;

			DOM.SetStyle(adjustItem, positionStyleName, `${adjustPosition}px`);

			startOffset = currentOffset;

			if (bLeftTop && !bRightBottom || !bLeftTop && bRightBottom) {
				const cells = bLeftTop ? nextAdjustableCells : adjustableCells;
				const comparableMinimumSize = bLeftTop ? nextMinimumSize : minimumSize;
				const multiplier = bLeftTop ? 1 : -1;
				const calculatedSize = calculated * multiplier;

				const calculatedComparison = bLeftTop ? calculated > 0 : calculated < 0;

				const sizeBeforeChanging = GetClientSize(cells[0], sizeStyleName);

				if (sizeBeforeChanging <= comparableMinimumSize && calculatedComparison && lastAdjustPosition === -1) {
					if (savedAdjustPosition === -1) savedAdjustPosition = getPosition(adjustItem);
					lastAdjustPosition = savedAdjustPosition;

					if (savedTableSize !== -1 || savedTablePosition !== -1) return;

					savedTableSize = GetClientSize(fakeTable, sizeStyleName);
					savedTablePosition = getPosition(fakeTable);
					setSavedTableSize(cells);
					return;
				}

				if (lastAdjustPosition !== -1) {
					if (GetClientSize(fakeTable, sizeStyleName) !== savedTableSize || getPosition(fakeTable) !== savedTablePosition)
						setSavedTableSize(cells);

					const positionComparison = (lastAdjustPosition - getPosition(adjustItem)) * multiplier;
					if (calculatedComparison || positionComparison < 0) return;
					lastAdjustPosition = -1;
				}

				const tableStyleValue = DOM.GetStyle(fakeTable, sizeStyleName);
				const tableSize = (Str.IsEmpty(tableStyleValue) ? GetClientSize(fakeTable, sizeStyleName) : parseFloat(tableStyleValue)) - calculatedSize;
				const tablePositionStyleValue = DOM.GetStyle(fakeTable, positionStyleName);
				const tablePosition = (Str.IsEmpty(tablePositionStyleValue) ? getPosition(fakeTable) : parseFloat(tablePositionStyleValue)) + calculatedSize;

				const newStyle: Record<string, string> = {};
				newStyle[sizeStyleName] = `${tableSize}px`;
				if (bLeftTop) newStyle[positionStyleName] = `${tablePosition}px`;
				DOM.SetStyles(fakeTable, newStyle);

				for (const cell of cells) {
					const styleValue = DOM.GetStyle(cell, sizeStyleName);
					const size = (Str.IsEmpty(styleValue) ? GetClientSize(cell, sizeStyleName) : parseFloat(styleValue)) - calculatedSize;
					DOM.SetStyle(cell, sizeStyleName, `${size}px`);
				}
				return;
			}

			// TODO: Adjust the middle of cells
			return;
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);

			DOM.SetStyle(table, sizeStyleName, DOM.GetStyle(fakeTable, sizeStyleName));

			for (let rowIndex = 0, rowLength = fakeTableGrid.TableGrid.length; rowIndex < rowLength; ++rowIndex) {
				const row = fakeTableGrid.TableGrid[rowIndex];

				for (let cellIndex = 0, cellLength = row.length; cellIndex < cellLength; ++cellIndex) {
					const column = row[cellIndex];
					const size = DOM.GetStyle(column, sizeStyleName);
					DOM.SetStyle(tableGrid.TableGrid[rowIndex][cellIndex], sizeStyleName, size);
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
		BoundEvents: [ENativeEvents.mousemove, mouseMoveInTable as (event: Event) => void],
		Element: adjustableLineGroup,
	};
};

export default AdjustableLine;