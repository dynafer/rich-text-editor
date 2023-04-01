import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { CreateAdjustableEdgeSize, RegisterAdjustingEvents } from '../Utils';
import AdjustingNavigation from './AdjustingNavigation';
import { CreateFakeFigure, CreateFakeMedia, MakeAbsolute, ResetAbsolute } from './MediaToolsUtils';

const AdjustableEdge = (editor: Editor, media: HTMLElement): HTMLElement => {
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
				left: CreateAdjustableEdgeSize(media.offsetLeft + (bLeft ? 0 : media.offsetWidth), true),
				top: CreateAdjustableEdgeSize(media.offsetTop + (bTop ? 0 : media.offsetHeight), true),
			},
		});

	const leftTopEdge = createCommonEdge('west', true, true);
	const rightTopEdge = createCommonEdge('east', false, true);
	const leftBottomEdge = createCommonEdge('east', true, false);
	const rightBottomEdge = createCommonEdge('west', false, false);

	const setEdgePositionStyles = (figureElement: HTMLElement, element: HTMLElement, bLeft: boolean, bTop: boolean) =>
		DOM.SetStyles(element, {
			left: CreateAdjustableEdgeSize(figureElement.offsetLeft + (bLeft ? 0 : figureElement.offsetWidth), true),
			top: CreateAdjustableEdgeSize(figureElement.offsetTop + (bTop ? 0 : figureElement.offsetHeight), true),
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

		let startOffsetX = event.clientX;
		let startOffsetY = event.clientY;

		const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(adjustItem);
		if (!Figure || !FigureElement) return;

		const bIFrame = DOM.Utils.IsIFrame(FigureElement);

		const figureElement = bIFrame ? CreateFakeMedia(self, FigureElement) : FigureElement;
		if (bIFrame) {
			DOM.InsertAfter(FigureElement, figureElement);
			DOM.Hide(FigureElement);
		}

		const bLeft = adjustItem === leftTopEdge || adjustItem === leftBottomEdge;
		const bTop = adjustItem === leftTopEdge || adjustItem === rightTopEdge;

		const oldWidth = figureElement.offsetWidth;
		const oldHeight = figureElement.offsetHeight;
		const oldLeft = figureElement.offsetLeft;
		const oldTop = figureElement.offsetTop;

		self.SaveScrollPosition();

		const navigation = AdjustingNavigation(self, FigureElement, figureElement);
		navigation.Update(startOffsetX, startOffsetY);

		const fakeFigure = CreateFakeFigure(self, Figure, figureElement);
		DOM.InsertBefore(Figure, fakeFigure.Figure);
		MakeAbsolute(self, fakeFigure, Figure, figureElement);

		const dumpWidth = DOM.GetStyle(figureElement, 'width');
		const dumpHeight = DOM.GetStyle(figureElement, 'height');

		DOM.SetStyles(figureElement, {
			width: '0px',
			height: '0px',
		});

		const minWidth = figureElement.offsetWidth;
		const minHeight = figureElement.offsetHeight;
		const minLeft = figureElement.offsetLeft + (bLeft ? Math.max(minWidth - oldWidth, oldWidth - minWidth) : 0);
		const minTop = figureElement.offsetTop + (bTop ? Math.max(minHeight - oldHeight, oldHeight - minHeight) : 0);

		updateEdgePosition(figureElement);

		const toggleWidth = !Str.IsEmpty(dumpWidth) ? DOM.SetStyle : DOM.RemoveStyle;
		const toggleHeight = !Str.IsEmpty(dumpHeight) ? DOM.SetStyle : DOM.RemoveStyle;
		toggleWidth(figureElement, 'width', dumpWidth);
		toggleHeight(figureElement, 'height', dumpHeight);

		updateEdgePosition(figureElement);

		self.ScrollSavedPosition();

		const lineGroup = DOM.Select<HTMLElement>({ attrs: ['data-adjustable-line-group'] }, Figure);
		DOM.Hide(lineGroup);

		const bFigureRight = DOM.HasStyle(Figure, 'float', 'right')
			|| (DOM.HasStyle(Figure, 'margin-left', 'auto') && !DOM.HasStyle(Figure, 'margin-right', 'auto'));

		const adjustLeftDifference = minLeft - oldLeft + (bLeft ? 0 : (minWidth - oldWidth));
		const minimumOffsetX = startOffsetX + adjustLeftDifference;
		const minimumAdjustPositionX = adjustItem.offsetLeft + adjustLeftDifference;

		const adjustTopDifference = minTop - oldTop + (bTop ? 0 : (minHeight - oldHeight));
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
				return calculated;
			}

			if (calculated < 0 && offsetDifference <= 0 && adjustDifference <= 0) {
				if (bHorizontal) bUpdatableX = false;
				else bUpdatableY = false;
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

			navigation.Update(currentOffsetX, currentOffsetY);

			if ((Type.IsBoolean(calculatedX) && !calculatedX) && (Type.IsBoolean(calculatedY) && !calculatedY)) return;

			const newStyle: Record<string, string> = {};

			const updateSize = (type: 'width' | 'height', calculated: number, bUpdatePosition: boolean) => {
				const bWidth = type === 'width';
				const newSize = (bWidth ? figureElement.offsetWidth : figureElement.offsetHeight) + calculated;
				newStyle[type] = `${newSize}px`;
				if (!bUpdatePosition) return;

				const minPosition = (bWidth ? minLeft : minTop) + (bWidth ? minWidth : minHeight);
				newStyle[bWidth ? 'left' : 'top'] = `${minPosition - newSize}px`;
			};

			if (!Type.IsBoolean(calculatedX)) updateSize('width', calculatedX, bLeft && !bFigureRight);
			if (!Type.IsBoolean(calculatedY)) updateSize('height', calculatedY, bTop);

			DOM.SetStyles(figureElement, newStyle);

			if (bLeft && bFigureRight && !Type.IsBoolean(calculatedX))
				DOM.SetStyles(Figure, {
					left: `${Figure.offsetLeft - parseFloat(DOM.GetStyle(Figure, 'margin-left', true)) - calculatedX}px`,
					width: `${Figure.offsetWidth + calculatedX}px`
				});

			updateEdgePosition(figureElement);
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);

			fakeFigure.Figure.remove();

			ResetAbsolute(self, Figure, figureElement);

			if (bIFrame) {
				DOM.Show(FigureElement);
				DOM.SetStyles(FigureElement, {
					width: DOM.GetStyle(figureElement, 'width'),
					height: DOM.GetStyle(figureElement, 'height'),
				});
				figureElement.remove();
			}

			DOM.Show(lineGroup);

			navigation.Destory();
		};

		RegisterAdjustingEvents(self, FigureElement, adjust, finishAdjusting);
	};

	const edges = [leftTopEdge, rightTopEdge, leftBottomEdge, rightBottomEdge];
	Arr.Each(edges, edge => DOM.On(edge, ENativeEvents.mousedown, startAdjusting));

	DOM.Insert(adjustableEdgeGroup, ...edges);

	return adjustableEdgeGroup;
};

export default AdjustableEdge;