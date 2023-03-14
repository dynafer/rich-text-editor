import { Arr, Type } from '@dynafer/utils';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { CreateAdjustableEdgeSize, CreateCurrentPoint, CreateFakeTable, GetClientSize, GetTableGridWithIndex, ITableGrid, MoveToCurrentPoint } from './TableToolsUtils';

interface ICellStyleMap {
	cell: HTMLElement,
	styles: Record<string, string>,
}

const AdjustableEdge = (editor: Editor, table: HTMLElement, tableGrid: ITableGrid): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;
	const TableTools = self.Tools.DOM.Table;

	const adjustableEdgeGroup = DOM.Create('div', {
		attrs: {
			dataAdjustableEdgeGroup: '',
		},
	});

	const createCommonEdge = (type: 'west' | 'east', bLeft: boolean, bTop: boolean): HTMLElement =>
		DOM.Create('div', {
			attrs: {
				dataAdjustableEdge: type,
				dataHorizontal: bLeft ? 'left' : 'right',
				dataVertical: bTop ? 'top' : 'bottom',
			},
			styles: {
				left: CreateAdjustableEdgeSize(table.offsetLeft + (bLeft ? 0 : table.offsetWidth), true),
				top: CreateAdjustableEdgeSize(table.offsetTop + (bTop ? 0 : table.offsetHeight), true),
			},
		});

	const leftTopEdge = createCommonEdge('west', true, true);
	const rightTopEdge = createCommonEdge('east', false, true);
	const leftBottomEdge = createCommonEdge('east', true, false);
	const rightBottomEdge = createCommonEdge('west', false, false);

	const setEdgePositionStyles = (targetTable: HTMLElement, element: HTMLElement, bLeft: boolean, bTop: boolean) =>
		DOM.SetStyles(element, {
			left: CreateAdjustableEdgeSize(targetTable.offsetLeft + (bLeft ? 0 : targetTable.offsetWidth), true),
			top: CreateAdjustableEdgeSize(targetTable.offsetTop + (bTop ? 0 : targetTable.offsetHeight), true),
		});

	const updateEdgePosition = (targetTable: HTMLElement) => {
		setEdgePositionStyles(targetTable, leftTopEdge, true, true);
		setEdgePositionStyles(targetTable, rightTopEdge, false, true);
		setEdgePositionStyles(targetTable, leftBottomEdge, true, false);
		setEdgePositionStyles(targetTable, rightBottomEdge, false, false);
	};

	const startAdjusting = (event: MouseEvent) => {
		PreventEvent(event);

		const adjustItem = event.target as HTMLElement;

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

		let startOffsetX = event.clientX;
		let startOffsetY = event.clientY;

		const bLeft = adjustItem === leftTopEdge || adjustItem === leftBottomEdge;
		const bTop = adjustItem === leftTopEdge || adjustItem === rightTopEdge;

		const oldWidth = table.offsetWidth;
		const oldHeight = table.offsetHeight;

		const fakeTable = CreateFakeTable(self, table);
		DOM.Insert(adjustableEdgeGroup, fakeTable);

		const fakeTableGrid = GetTableGridWithIndex(self, fakeTable);
		const cellSizePercents: [number, number][][] = [];

		for (const row of fakeTableGrid.Grid) {
			const cellSizePercent: [number, number][] = [];

			for (const cell of row) {
				Arr.Push(cellSizePercent, [
					cell.offsetWidth / oldWidth,
					cell.offsetHeight / oldHeight
				]);
			}

			Arr.Push(cellSizePercents, cellSizePercent);
		}

		for (const row of fakeTableGrid.Grid) {
			for (const cell of row) {
				if (!DOM.HasAttr(cell, 'dump-width') && DOM.HasStyle(cell, 'width')) {
					DOM.SetAttr(cell, 'dump-width', DOM.GetStyle(cell, 'width'));
					DOM.RemoveStyle(cell, 'width');
				}
				if (!DOM.HasAttr(cell, 'dump-height') && DOM.HasStyle(cell, 'height')) {
					DOM.SetAttr(cell, 'dump-height', DOM.GetStyle(cell, 'height'));
					DOM.RemoveStyle(cell, 'height');
				}
			}
		}

		const minWidth = fakeTable.offsetWidth;
		const minHeight = fakeTable.offsetHeight;
		const minLeft = fakeTable.offsetLeft + Math.max(0, oldWidth - minWidth);
		const minTop = fakeTable.offsetTop + Math.max(0, oldHeight - minHeight);

		setEdgePositionStyles(fakeTable, adjustItem, bLeft, bTop);
		const savedAdjustItemLeft = adjustItem.offsetLeft + (bLeft ? Math.max(0, oldWidth - minWidth) : 0);
		const savedAdjustItemTop = adjustItem.offsetTop + (bTop ? Math.max(0, oldHeight - minHeight) : 0);

		for (const row of fakeTableGrid.Grid) {
			for (const cell of row) {
				if (DOM.HasAttr(cell, 'dump-width')) {
					DOM.SetStyle(cell, 'width', DOM.GetAttr(cell, 'dump-width') ?? '');
					DOM.RemoveAttr(cell, 'dump-width');
				}
				if (DOM.HasAttr(cell, 'dump-height')) {
					DOM.SetStyle(cell, 'height', DOM.GetAttr(cell, 'dump-height') ?? '');
					DOM.RemoveAttr(cell, 'dump-height');
				}
			}
		}

		setEdgePositionStyles(fakeTable, adjustItem, bLeft, bTop);

		const movable = DOM.Select<HTMLElement>({ attrs: ['data-movable'] }, table.parentNode);
		DOM.Hide(movable);

		let lastAdjustOffsetX = -1;
		let lastAdjustOffsetY = -1;

		const isUpdatable = (bHorizontal: boolean, current: number): false | number => {
			const bLeftOrTop = bHorizontal ? bLeft : bTop;
			const startOffset = bHorizontal ? startOffsetX : startOffsetY;
			const calculated = bLeftOrTop ? startOffset - current : current - startOffset;
			if (calculated === 0) return false;

			const adjustPosition = bHorizontal ? adjustItem.offsetLeft : adjustItem.offsetTop;
			const savedPosition = bHorizontal ? savedAdjustItemLeft : savedAdjustItemTop;
			const lastAdjustOffset = bHorizontal ? lastAdjustOffsetX : lastAdjustOffsetY;

			const estimateAdjustPosition = adjustPosition + (calculated * (bLeftOrTop ? -1 : 1));

			const bUnderPosition = bLeftOrTop ? estimateAdjustPosition >= savedPosition : estimateAdjustPosition <= savedPosition;
			const bUnderOffset = bLeftOrTop ? lastAdjustOffset > current : lastAdjustOffset < current;

			if (bHorizontal) startOffsetX = current;
			else startOffsetY = current;

			const difference = adjustPosition - savedPosition;

			if (lastAdjustOffset !== -1) {
				const bReset = calculated > 0 && !bUnderPosition && bUnderOffset;
				if (bReset) {
					if (bHorizontal) lastAdjustOffsetX = -1;
					else lastAdjustOffsetY = -1;

					return calculated;
				}

				const tablePosition = bHorizontal ? fakeTable.offsetLeft : fakeTable.offsetTop;
				DOM.SetStyle(fakeTable, bHorizontal ? 'left' : 'top', `${tablePosition}px`);

				updateEdgePosition(fakeTable);

				return false;
			}

			const bSave = calculated < 0 && bUnderPosition;
			if (bSave) {
				if (bHorizontal) lastAdjustOffsetX = current + difference;
				else lastAdjustOffsetY = current + difference;

				const tablePosition = bHorizontal ? fakeTable.offsetLeft : fakeTable.offsetTop;
				DOM.SetStyle(fakeTable, bHorizontal ? 'left' : 'top', `${tablePosition}px`);

				updateEdgePosition(fakeTable);

				return false;
			}

			return calculated;
		};

		const adjust = (e: MouseEvent) => {
			PreventEvent(e);

			const currentOffsetX = e.clientX;
			const currentOffsetY = e.clientY;

			const calculatedX = isUpdatable(true, currentOffsetX);
			const calculatedY = isUpdatable(false, currentOffsetY);

			if ((Type.IsBoolean(calculatedX) && !calculatedX) && (Type.IsBoolean(calculatedY) && !calculatedY)) return;

			const applyStyles: [HTMLElement, Record<string, string>][] = [];

			for (let rowIndex = 0, rowLength = cellSizePercents.length; rowIndex < rowLength; ++rowIndex) {
				for (let cellIndex = 0, cellLength = cellSizePercents[rowIndex].length; cellIndex < cellLength; ++cellIndex) {
					const cell = fakeTableGrid.Grid[rowIndex][cellIndex];
					const cellSizePercent = cellSizePercents[rowIndex][cellIndex];
					const newStyle: Record<string, string> = {};

					if (!Type.IsBoolean(calculatedX)) {
						const addableWidth = Math.round(calculatedX * cellSizePercent[0] * 100) * 0.01;
						if (addableWidth !== 0) newStyle.width = `${GetClientSize(self, cell, 'width') + addableWidth}px`;
					}

					if (!Type.IsBoolean(calculatedY)) {
						const addableHeight = Math.round(calculatedY * cellSizePercent[1] * 100) * 0.01;
						if (addableHeight !== 0) newStyle.height = `${GetClientSize(self, cell, 'height') + addableHeight}px`;
					}

					Arr.Push(applyStyles, [cell, newStyle]);
				}
			}

			for (const [cell, styles] of applyStyles) {
				DOM.SetStyles(cell, styles);
			}

			const newStyle: Record<string, string> = {};

			if (!Type.IsBoolean(calculatedX) && bLeft) {
				newStyle.left = `${minLeft + minWidth - fakeTable.offsetWidth}px`;
			}
			if (!Type.IsBoolean(calculatedY) && bTop) {
				newStyle.top = `${minTop + minHeight - fakeTable.offsetHeight}px`;
			}

			DOM.SetStyles(fakeTable, newStyle);

			updateEdgePosition(fakeTable);
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);
			removeEvents();

			const newWidth = fakeTable.offsetWidth;
			const newHeight = fakeTable.offsetHeight;

			DOM.Remove(fakeTable);

			const cellGridStyles: ICellStyleMap[][] = [];

			const widthDifference = newWidth - oldWidth;
			const heightDifference = newHeight - oldHeight;

			for (const row of tableGrid.Grid) {
				const cellStyles: ICellStyleMap[] = [];

				for (const cell of row) {
					const percentCellWidth = cell.offsetWidth / oldWidth;
					const percentCellHeight = cell.offsetHeight / oldHeight;

					const newCellWidth = Math.round(widthDifference * percentCellWidth * 100) * 0.01;
					const newCellHeight = Math.round(heightDifference * percentCellHeight * 100) * 0.01;

					Arr.Push(cellStyles, {
						cell,
						styles: {
							width: `${cell.offsetWidth + newCellWidth}px`,
							height: `${cell.offsetHeight + newCellHeight}px`,
						}
					});
				}

				Arr.Push(cellGridStyles, cellStyles);
			}

			for (const gridStyles of cellGridStyles) {
				for (const { cell, styles } of gridStyles) {
					DOM.SetStyles(cell, styles);
				}
			}

			DOM.Show(movable);

			TableTools.ChangePositions();

			moveToSavedPoint();
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

	const edges = [leftTopEdge, rightTopEdge, leftBottomEdge, rightBottomEdge];
	for (const edge of edges) {
		DOM.On(edge, ENativeEvents.mousedown, startAdjusting);
	}

	DOM.Insert(adjustableEdgeGroup, ...edges);

	return adjustableEdgeGroup;
};

export default AdjustableEdge;