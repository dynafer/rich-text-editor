import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { CreateAdjustableEdgeSize, GetClientSize, RegisterAdjustingEvents } from '../Utils';
import { CreateCurrentPoint, CreateFakeFigure, MakeAbsolute, MoveToCurrentPoint, ResetAbsolute, WalkGrid } from './TableToolsUtils';


const AdjustableEdge = (editor: Editor, table: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;

	const adjustableEdgeGroup = DOM.Create('div', {
		attrs: ['data-adjustable-edge-group'],
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

	const updateEdgePosition = (figureElement: HTMLElement) => {
		setEdgePositionStyles(figureElement, leftTopEdge, true, true);
		setEdgePositionStyles(figureElement, rightTopEdge, false, true);
		setEdgePositionStyles(figureElement, leftBottomEdge, true, false);
		setEdgePositionStyles(figureElement, rightBottomEdge, false, false);
	};

	const startAdjusting = (event: MouseEvent) => {
		PreventEvent(event);

		const adjustItem = event.target as HTMLElement;

		let startOffsetX = event.pageX;
		let startOffsetY = event.pageY;

		const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(adjustItem);
		if (!Figure || !FigureElement) return;

		let savedPoint = CreateCurrentPoint(self, FigureElement);

		const bLeft = adjustItem === leftTopEdge || adjustItem === leftBottomEdge;
		const bTop = adjustItem === leftTopEdge || adjustItem === rightTopEdge;

		const oldWidth = FigureElement.offsetWidth;
		const oldHeight = FigureElement.offsetHeight;
		const oldLeft = FigureElement.offsetLeft;
		const oldTop = FigureElement.offsetTop;

		self.SaveScrollPosition();

		const { Grid } = DOM.Element.Table.GetGridWithIndex(FigureElement);

		const fakeFigure = CreateFakeFigure(self, Figure, FigureElement);
		DOM.InsertBefore(Figure, fakeFigure.Figure);
		MakeAbsolute(self, fakeFigure, Figure, FigureElement);

		const dumpStyles: [HTMLElement, Record<string, string>][] = [];

		WalkGrid(Grid, cell =>
			Arr.Push(dumpStyles, [cell, {
				width: `${GetClientSize(self, cell, 'width') / oldWidth * 100}%`,
				height: `${GetClientSize(self, cell, 'height') / oldHeight * 100}%`,
			}])
		);

		const dumpWidth = DOM.GetStyle(FigureElement, 'width');
		const dumpHeight = DOM.GetStyle(FigureElement, 'height');

		DOM.SetStyles(FigureElement, {
			width: '0px',
			height: '0px',
		});

		WalkGrid(Grid, cell => DOM.RemoveStyles(cell, 'width', 'height'));

		const minWidth = FigureElement.offsetWidth;
		const minHeight = FigureElement.offsetHeight;
		const minLeft = FigureElement.offsetLeft + (bLeft ? Math.max(minWidth - oldWidth, oldWidth - minWidth) : 0);
		const minTop = FigureElement.offsetTop + (bTop ? Math.max(minHeight - oldHeight, oldHeight - minHeight) : 0);

		const toggleWidth = !Str.IsEmpty(dumpWidth) ? DOM.SetStyle : DOM.RemoveStyle;
		const toggleHeight = !Str.IsEmpty(dumpHeight) ? DOM.SetStyle : DOM.RemoveStyle;
		toggleWidth(FigureElement, 'width', dumpWidth);
		toggleHeight(FigureElement, 'height', dumpHeight);

		Arr.WhileShift(dumpStyles, ([cell, styles]) => DOM.SetStyles(cell, styles));

		updateEdgePosition(FigureElement);

		self.ScrollSavedPosition();

		const lineGroup = DOM.Select<HTMLElement>({ attrs: ['data-adjustable-line-group'] }, Figure);
		DOM.Hide(lineGroup);

		const movable = DOM.Select<HTMLElement>({ attrs: ['data-movable'] }, Figure);
		DOM.Hide(movable);

		const adjustLeftDifference = (bLeft ? minLeft - oldLeft : oldLeft - minLeft) + (bLeft ? 0 : (minWidth - oldWidth));
		const minimumOffsetX = startOffsetX + adjustLeftDifference;

		const adjustTopDifference = (bTop ? minTop - oldTop : oldTop - minTop) + (bTop ? 0 : (minHeight - oldHeight));
		const minimumOffsetY = startOffsetY + adjustTopDifference;

		const isUpdatable = (bHorizontal: boolean, current: number): false | number => {
			const bLeftOrTop = bHorizontal ? bLeft : bTop;
			const startOffset = bHorizontal ? startOffsetX : startOffsetY;
			const calculated = bLeftOrTop ? startOffset - current : current - startOffset;
			if (calculated === 0) return false;

			if (bHorizontal) startOffsetX = current;
			else startOffsetY = current;

			const figureSize = bHorizontal ? FigureElement.offsetWidth : FigureElement.offsetHeight;
			const minimumSize = bHorizontal ? minWidth : minHeight;
			const minimumOffset = bHorizontal ? minimumOffsetX : minimumOffsetY;
			const offsetDifference = bLeftOrTop ? minimumOffset - current : current - minimumOffset;

			if (figureSize + calculated > minimumSize && offsetDifference > 0) return calculated;

			DOM.SetStyle(FigureElement, bHorizontal ? 'width' : 'height', `${bHorizontal ? minWidth : minHeight}px`);
			if ((bHorizontal && bLeft) || (!bHorizontal && bTop))
				DOM.SetStyle(FigureElement, bHorizontal ? 'left' : 'top', `${bHorizontal ? minLeft : minTop}px`);

			return false;
		};

		const adjust = (e: MouseEvent) => {
			PreventEvent(e);

			const currentOffsetX = e.pageX;
			const currentOffsetY = e.pageY;

			const calculatedX = isUpdatable(true, currentOffsetX);
			const calculatedY = isUpdatable(false, currentOffsetY);

			if ((Type.IsBoolean(calculatedX) && !calculatedX) && (Type.IsBoolean(calculatedY) && !calculatedY)) return;

			const newStyle: Record<string, string> = {};

			const updateSize = (type: 'width' | 'height', calculated: number, bUpdatePosition: boolean) => {
				const bWidth = type === 'width';
				const newSize = (bWidth ? FigureElement.offsetWidth : FigureElement.offsetHeight) + calculated;
				newStyle[type] = `${newSize}px`;
				if (!bUpdatePosition) return;

				const minPosition = (bWidth ? minLeft : minTop) + (bWidth ? minWidth : minHeight);
				newStyle[bWidth ? 'left' : 'top'] = `${minPosition - newSize}px`;
			};

			if (!Type.IsBoolean(calculatedX)) updateSize('width', calculatedX, bLeft);
			if (!Type.IsBoolean(calculatedY)) updateSize('height', calculatedY, bTop);

			DOM.SetStyles(FigureElement, newStyle);

			updateEdgePosition(FigureElement);
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);

			DOM.Remove(fakeFigure.Figure);

			const cellStyles: [HTMLElement, Record<string, string>][] = [];

			WalkGrid(Grid, cell =>
				Arr.Push(cellStyles, [
					cell,
					{
						width: `${GetClientSize(self, cell, 'width')}px`,
						height: `${GetClientSize(self, cell, 'height')}px`
					}
				])
			);

			Arr.WhileShift(cellStyles, ([cell, styles]) => DOM.SetStyles(cell, styles));

			ResetAbsolute(self, Figure, FigureElement);

			DOM.Show(lineGroup);
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