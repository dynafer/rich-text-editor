import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { CreateAdjustableEdgeSize, RegisterAdjustingEvents } from '../Utils';
import AdjustingNavigation from './AdjustingNavigation';
import { CreateFakeFigure, MakeAbsolute, ResetAbsolute } from './ImageToolsUtils';

const AdjustableEdge = (editor: Editor, image: HTMLImageElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;

	const adjustableEdgeGroup = DOM.Create('div', {
		attrs: {
			dataAdjustableEdgeGroup: '',
		},
	});

	const figure = image.parentNode as HTMLElement;

	const createCommonEdge = (type: 'west' | 'east', bLeft: boolean, bTop: boolean): HTMLElement =>
		DOM.Create('div', {
			attrs: {
				dataAdjustableEdge: type,
				dataHorizontal: bLeft ? 'left' : 'right',
				dataVertical: bTop ? 'top' : 'bottom',
			},
			styles: {
				left: CreateAdjustableEdgeSize(image.offsetLeft + (bLeft ? 0 : image.offsetWidth), true),
				top: CreateAdjustableEdgeSize(image.offsetTop + (bTop ? 0 : image.offsetHeight), true),
			},
		});

	const leftTopEdge = createCommonEdge('west', true, true);
	const rightTopEdge = createCommonEdge('east', false, true);
	const leftBottomEdge = createCommonEdge('east', true, false);
	const rightBottomEdge = createCommonEdge('west', false, false);

	const setEdgePositionStyles = (element: HTMLElement, bLeft: boolean, bTop: boolean) =>
		DOM.SetStyles(element, {
			left: CreateAdjustableEdgeSize(image.offsetLeft + (bLeft ? 0 : image.offsetWidth), true),
			top: CreateAdjustableEdgeSize(image.offsetTop + (bTop ? 0 : image.offsetHeight), true),
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

		let startOffsetX = event.clientX;
		let startOffsetY = event.clientY;

		const bLeft = adjustItem === leftTopEdge || adjustItem === leftBottomEdge;
		const bTop = adjustItem === leftTopEdge || adjustItem === rightTopEdge;

		const oldWidth = image.offsetWidth;
		const oldHeight = image.offsetHeight;
		const oldLeft = image.offsetLeft;
		const oldTop = image.offsetTop;

		self.SaveScrollPosition();

		const navigation = AdjustingNavigation(self, image);
		navigation.Update(startOffsetX, startOffsetY);

		const fakeFigure = CreateFakeFigure(self, figure, image);
		DOM.InsertBefore(figure, fakeFigure.Figure);
		MakeAbsolute(self, fakeFigure, figure, image);

		const dumpWidth = DOM.GetStyle(image, 'width');
		const dumpHeight = DOM.GetStyle(image, 'height');

		DOM.SetStyles(image, {
			width: '0px',
			height: '0px',
		});

		const minWidth = image.offsetWidth;
		const minHeight = image.offsetHeight;
		const minLeft = image.offsetLeft + (bLeft ? Math.max(minWidth - oldWidth, oldWidth - minWidth) : 0);
		const minTop = image.offsetTop + (bTop ? Math.max(minHeight - oldHeight, oldHeight - minHeight) : 0);

		updateEdgePosition();

		const toggleWidth = !Str.IsEmpty(dumpWidth) ? DOM.SetStyle : DOM.RemoveStyle;
		const toggleHeight = !Str.IsEmpty(dumpHeight) ? DOM.SetStyle : DOM.RemoveStyle;
		toggleWidth(image, 'width', dumpWidth);
		toggleHeight(image, 'height', dumpHeight);

		updateEdgePosition();

		self.ScrollSavedPosition();

		const lineGroup = DOM.Select<HTMLElement>({ attrs: ['data-adjustable-line-group'] }, figure);
		DOM.Hide(lineGroup);

		const bFigureRight = DOM.HasStyle(figure, 'float', 'right')
			|| (DOM.HasStyle(figure, 'margin-left', 'auto') && !DOM.HasStyle(figure, 'margin-right', 'auto'));

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
				const newWidth = image.offsetWidth + calculatedX;
				newStyle.width = `${newWidth}px`;
				if (bLeft && !bFigureRight) newStyle.left = `${minLeft + minWidth - newWidth}px`;
			}
			if (!Type.IsBoolean(calculatedY)) {
				const newHeight = image.offsetHeight + calculatedY;
				newStyle.height = `${newHeight}px`;
				if (bTop) newStyle.top = `${minTop + minHeight - newHeight}px`;
			}

			DOM.SetStyles(image, newStyle);

			if (bLeft && bFigureRight && !Type.IsBoolean(calculatedX))
				DOM.SetStyles(figure, {
					left: `${figure.offsetLeft - parseFloat(DOM.GetStyle(figure, 'margin-left', true)) - calculatedX}px`
				});

			updateEdgePosition();
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);

			fakeFigure.Figure.remove();

			ResetAbsolute(self, figure, image);

			DOM.Show(lineGroup);

			navigation.Remove();
		};

		RegisterAdjustingEvents(self, adjust, finishAdjusting);
	};

	const edges = [leftTopEdge, rightTopEdge, leftBottomEdge, rightBottomEdge];
	Arr.Each(edges, edge => DOM.On(edge, ENativeEvents.mousedown, startAdjusting));

	DOM.Insert(adjustableEdgeGroup, ...edges);

	return adjustableEdgeGroup;
};

export default AdjustableEdge;