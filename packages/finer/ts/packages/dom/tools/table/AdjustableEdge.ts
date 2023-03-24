import { Arr, Formula, Type } from '@dynafer/utils';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { CreateAdjustableEdgeSize, GetClientSize, RegisterAdjustingEvents } from '../Utils';
import { CreateCurrentPoint, CreateFakeTable, GetTableGridWithIndex, MoveToCurrentPoint } from './TableToolsUtils';

interface ICellStyleMap {
	cell: HTMLElement,
	styles: Record<string, string>,
}

const AdjustableEdge = (editor: Editor, table: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;

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

	const startAdjusting = (event: MouseEvent) => {
		PreventEvent(event);

		const adjustItem = event.target as HTMLElement;

		const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(adjustItem);
		if (!Figure || !FigureElement) return;

		let savedPoint = CreateCurrentPoint(self, FigureElement);

		let startOffsetX = event.clientX;
		let startOffsetY = event.clientY;

		const bLeft = adjustItem === leftTopEdge || adjustItem === leftBottomEdge;
		const bTop = adjustItem === leftTopEdge || adjustItem === rightTopEdge;

		self.SaveScrollPosition();

		const tableGrid = GetTableGridWithIndex(self, FigureElement);

		const fakeTable = CreateFakeTable(self, FigureElement);
		DOM.Insert(adjustableEdgeGroup, fakeTable);

		const oldWidth = fakeTable.offsetWidth;
		const oldHeight = fakeTable.offsetHeight;
		const oldLeft = fakeTable.offsetLeft;
		const oldTop = fakeTable.offsetTop;

		const fakeTableGrid = GetTableGridWithIndex(self, fakeTable);
		const cellSizePercents: [number, number][][] = [];

		Arr.Each(fakeTableGrid.Grid, row => {
			const cellSizePercent: [number, number][] = [];

			Arr.Each(row, cell =>
				Arr.Push(cellSizePercent, [
					cell.offsetWidth / oldWidth,
					cell.offsetHeight / oldHeight
				])
			);

			Arr.Push(cellSizePercents, cellSizePercent);
		});

		Arr.Each(fakeTableGrid.Grid, row =>
			Arr.Each(row, cell => {
				if (!DOM.HasAttr(cell, 'dump-width') && DOM.HasStyle(cell, 'width')) {
					DOM.SetAttr(cell, 'dump-width', DOM.GetStyle(cell, 'width'));
					DOM.RemoveStyle(cell, 'width');
				}
				if (!DOM.HasAttr(cell, 'dump-height') && DOM.HasStyle(cell, 'height')) {
					DOM.SetAttr(cell, 'dump-height', DOM.GetStyle(cell, 'height'));
					DOM.RemoveStyle(cell, 'height');
				}
			})
		);

		const minWidth = fakeTable.offsetWidth;
		const minHeight = fakeTable.offsetHeight;
		const minLeft = fakeTable.offsetLeft + (bLeft ? Math.max(minWidth - oldWidth, oldWidth - minWidth) : 0);
		const minTop = fakeTable.offsetTop + (bTop ? Math.max(minHeight - oldHeight, oldHeight - minHeight) : 0);

		setEdgePositionStyles(fakeTable, adjustItem, bLeft, bTop);

		Arr.Each(fakeTableGrid.Grid, row =>
			Arr.Each(row, cell => {
				if (DOM.HasAttr(cell, 'dump-width')) {
					DOM.SetStyle(cell, 'width', DOM.GetAttr(cell, 'dump-width') ?? '');
					DOM.RemoveAttr(cell, 'dump-width');
				}
				if (DOM.HasAttr(cell, 'dump-height')) {
					DOM.SetStyle(cell, 'height', DOM.GetAttr(cell, 'dump-height') ?? '');
					DOM.RemoveAttr(cell, 'dump-height');
				}
			})
		);

		setEdgePositionStyles(fakeTable, adjustItem, bLeft, bTop);

		self.ScrollSavedPosition();

		const movable = DOM.Select<HTMLElement>({ attrs: ['data-movable'] }, Figure);
		DOM.Hide(movable);

		const startWidthDifference = bLeft ? 0 : (minWidth - oldWidth);
		const adjustLeftDifference = minLeft - oldLeft + startWidthDifference;
		const minimumOffsetX = startOffsetX + adjustLeftDifference;
		const minimumAdjustPositionX = adjustItem.offsetLeft + adjustLeftDifference;

		const startHeightDifference = bTop ? 0 : (minHeight - oldHeight);
		const adjustTopDifference = minTop - oldTop + startHeightDifference;
		const minimumOffsetY = startOffsetY + adjustTopDifference;
		const minimumAdjustPositionY = adjustItem.offsetTop + adjustTopDifference;

		let bUpdatableX = true;
		let bUpdatableY = true;

		const isUpdatable = (bHorizontal: boolean, current: number): false | number => {
			const bLeftOrTop = bHorizontal ? bLeft : bTop;
			const startOffset = bHorizontal ? startOffsetX : startOffsetY;
			const calculated = bLeftOrTop ? startOffset - current : current - startOffset;
			if (calculated === 0) return false;

			if (bHorizontal) startOffsetX = current;
			else startOffsetY = current;

			const minimumOffset = bHorizontal ? minimumOffsetX : minimumOffsetY;
			const minimumAdjustPosition = bHorizontal ? minimumAdjustPositionX : minimumAdjustPositionY;
			const currentAdjustPosition = bHorizontal ? adjustItem.offsetLeft : adjustItem.offsetTop;

			const offsetDifference = bLeftOrTop ? minimumOffset - current : current - minimumOffset;
			const adjustDifference = bLeftOrTop ? minimumAdjustPosition - currentAdjustPosition : currentAdjustPosition - minimumAdjustPosition;

			const bUpdatable = bHorizontal ? bUpdatableX : bUpdatableY;

			if (!bUpdatable) {
				if (calculated < 0 || (offsetDifference <= 0 && adjustDifference <= 0)) return false;

				if (bHorizontal) bUpdatableX = true;
				else bUpdatableY = true;
			} else {
				if (calculated < 0 && offsetDifference <= 0 && adjustDifference <= 0) {
					if (bHorizontal) bUpdatableX = false;
					else bUpdatableY = false;
					return false;
				}
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
						const addableWidth = Formula.RoundDecimal(calculatedX * cellSizePercent[0]);
						if (addableWidth !== 0) newStyle.width = `${GetClientSize(self, cell, 'width') + addableWidth}px`;
					}

					if (!Type.IsBoolean(calculatedY)) {
						const addableHeight = Formula.RoundDecimal(calculatedY * cellSizePercent[1]);
						if (addableHeight !== 0) newStyle.height = `${GetClientSize(self, cell, 'height') + addableHeight}px`;
					}

					Arr.Push(applyStyles, [cell, newStyle]);
				}
			}

			Arr.Each(applyStyles, ([cell, styles]) => DOM.SetStyles(cell, styles));

			const newStyle: Record<string, string> = {};

			if (!Type.IsBoolean(calculatedX) && bLeft) newStyle.left = `${minLeft + minWidth - fakeTable.offsetWidth}px`;
			if (!Type.IsBoolean(calculatedY) && bTop) newStyle.top = `${minTop + minHeight - fakeTable.offsetHeight}px`;

			DOM.SetStyles(fakeTable, newStyle);

			setEdgePositionStyles(fakeTable, leftTopEdge, true, true);
			setEdgePositionStyles(fakeTable, rightTopEdge, false, true);
			setEdgePositionStyles(fakeTable, leftBottomEdge, true, false);
			setEdgePositionStyles(fakeTable, rightBottomEdge, false, false);
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);

			const widthDifference = fakeTable.offsetWidth - oldWidth;
			const heightDifference = fakeTable.offsetHeight - oldHeight;

			DOM.Remove(fakeTable);

			const cellGridStyles: ICellStyleMap[][] = [];

			Arr.Each(tableGrid.Grid, row => {
				const cellStyles: ICellStyleMap[] = [];

				Arr.Each(row, cell => {
					const newCellWidth = Formula.RoundDecimal(widthDifference * cell.offsetWidth / oldWidth);
					const newCellHeight = Formula.RoundDecimal(heightDifference * cell.offsetHeight / oldHeight);

					Arr.Push(cellStyles, {
						cell,
						styles: {
							width: `${cell.offsetWidth + newCellWidth}px`,
							height: `${cell.offsetHeight + newCellHeight}px`,
						}
					});
				});

				Arr.Push(cellGridStyles, cellStyles);
			});

			Arr.Each(cellGridStyles, gridStyles =>
				Arr.Each(gridStyles, ({ cell, styles }) => DOM.SetStyles(cell, styles))
			);

			DOM.Show(movable);

			MoveToCurrentPoint(self, FigureElement, savedPoint);
			savedPoint = undefined;
		};

		RegisterAdjustingEvents(self, FigureElement, adjust, finishAdjusting);
	};

	const edges = [leftTopEdge, rightTopEdge, leftBottomEdge, rightBottomEdge];
	Arr.Each(edges, edge => DOM.On(edge, ENativeEvents.mousedown, startAdjusting));

	DOM.Insert(adjustableEdgeGroup, ...edges);

	return adjustableEdgeGroup;
};

export default AdjustableEdge;