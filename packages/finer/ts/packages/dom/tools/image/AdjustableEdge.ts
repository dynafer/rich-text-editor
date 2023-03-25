import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { CreateAdjustableEdgeSize, RegisterAdjustingEvents } from '../Utils';
import AdjustingNavigation from './AdjustingNavigation';
import { CreateFakeFigure, MakeAbsolute, ResetAbsolute } from './ImageToolsUtils';

const AdjustableEdge = (editor: Editor, img: HTMLElement): HTMLElement => {
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
				left: CreateAdjustableEdgeSize(img.offsetLeft + (bLeft ? 0 : img.offsetWidth), true),
				top: CreateAdjustableEdgeSize(img.offsetTop + (bTop ? 0 : img.offsetHeight), true),
			},
		});

	const leftTopEdge = createCommonEdge('west', true, true);
	const rightTopEdge = createCommonEdge('east', false, true);
	const leftBottomEdge = createCommonEdge('east', true, false);
	const rightBottomEdge = createCommonEdge('west', false, false);

	const setEdgePositionStyles = (element: HTMLElement, bLeft: boolean, bTop: boolean) =>
		DOM.SetStyles(element, {
			left: CreateAdjustableEdgeSize(img.offsetLeft + (bLeft ? 0 : img.offsetWidth), true),
			top: CreateAdjustableEdgeSize(img.offsetTop + (bTop ? 0 : img.offsetHeight), true),
		});

	const updateEdgePosition = () => {
		setEdgePositionStyles(leftTopEdge, true, true);
		setEdgePositionStyles(rightTopEdge, false, true);
		setEdgePositionStyles(leftBottomEdge, true, false);
		setEdgePositionStyles(rightBottomEdge, false, false);
	};

	const startAdjusting = (event: MouseEvent) => {
		PreventEvent(event);

		const adjustItem = event.target as HTMLElement;

		const { Figure, FigureType, FigureElement } = DOM.Element.Figure.Find<HTMLImageElement>(adjustItem);
		if (!Figure || !FigureType || !FigureElement) return;

		let startOffsetX = event.clientX;
		let startOffsetY = event.clientY;

		const bLeft = adjustItem === leftTopEdge || adjustItem === leftBottomEdge;
		const bTop = adjustItem === leftTopEdge || adjustItem === rightTopEdge;

		const oldWidth = FigureElement.offsetWidth;
		const oldHeight = FigureElement.offsetHeight;
		const oldLeft = FigureElement.offsetLeft;
		const oldTop = FigureElement.offsetTop;

		self.SaveScrollPosition();

		const navigation = AdjustingNavigation(self, FigureElement);
		navigation.Update(startOffsetX, startOffsetY);

		const fakeFigure = CreateFakeFigure(self, Figure, FigureElement);
		DOM.InsertBefore(Figure, fakeFigure.Figure);
		MakeAbsolute(self, fakeFigure, Figure, FigureElement);

		const dumpWidth = DOM.GetStyle(FigureElement, 'width');
		const dumpHeight = DOM.GetStyle(FigureElement, 'height');

		DOM.SetStyles(FigureElement, {
			width: '0px',
			height: '0px',
		});

		const minWidth = FigureElement.offsetWidth;
		const minHeight = FigureElement.offsetHeight;
		const minLeft = FigureElement.offsetLeft + (bLeft ? Math.max(minWidth - oldWidth, oldWidth - minWidth) : 0);
		const minTop = FigureElement.offsetTop + (bTop ? Math.max(minHeight - oldHeight, oldHeight - minHeight) : 0);

		updateEdgePosition();

		const toggleWidth = !Str.IsEmpty(dumpWidth) ? DOM.SetStyle : DOM.RemoveStyle;
		const toggleHeight = !Str.IsEmpty(dumpHeight) ? DOM.SetStyle : DOM.RemoveStyle;
		toggleWidth(FigureElement, 'width', dumpWidth);
		toggleHeight(FigureElement, 'height', dumpHeight);

		updateEdgePosition();

		self.ScrollSavedPosition();

		const lineGroup = DOM.Select<HTMLElement>({ attrs: ['data-adjustable-line-group'] }, Figure);
		DOM.Hide(lineGroup);

		const bFigureRight = DOM.HasStyle(Figure, 'float', 'right')
			|| (DOM.HasStyle(Figure, 'margin-left', 'auto') && !DOM.HasStyle(Figure, 'margin-right', 'auto'));

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

			navigation.Update(currentOffsetX, currentOffsetY);

			if ((Type.IsBoolean(calculatedX) && !calculatedX) && (Type.IsBoolean(calculatedY) && !calculatedY)) return;

			const newStyle: Record<string, string> = {};

			if (!Type.IsBoolean(calculatedX)) {
				const newWidth = FigureElement.offsetWidth + calculatedX;
				newStyle.width = `${newWidth}px`;
				if (bLeft && !bFigureRight) newStyle.left = `${minLeft + minWidth - newWidth}px`;
			}
			if (!Type.IsBoolean(calculatedY)) {
				const newHeight = FigureElement.offsetHeight + calculatedY;
				newStyle.height = `${newHeight}px`;
				if (bTop) newStyle.top = `${minTop + minHeight - newHeight}px`;
			}

			DOM.SetStyles(FigureElement, newStyle);

			if (bLeft && bFigureRight && !Type.IsBoolean(calculatedX))
				DOM.SetStyles(Figure, {
					left: `${Figure.offsetLeft - parseFloat(DOM.GetStyle(Figure, 'margin-left', true)) - calculatedX}px`,
					width: `${Figure.offsetWidth + calculatedX}px`
				});

			updateEdgePosition();
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);

			fakeFigure.Figure.remove();

			ResetAbsolute(self, Figure, FigureElement);

			DOM.Show(lineGroup);

			navigation.Remove();
		};

		RegisterAdjustingEvents(self, FigureElement, adjust, finishAdjusting);
	};

	const edges = [leftTopEdge, rightTopEdge, leftBottomEdge, rightBottomEdge];
	Arr.Each(edges, edge => DOM.On(edge, ENativeEvents.mousedown, startAdjusting));

	DOM.Insert(adjustableEdgeGroup, ...edges);

	return adjustableEdgeGroup;
};

export default AdjustableEdge;