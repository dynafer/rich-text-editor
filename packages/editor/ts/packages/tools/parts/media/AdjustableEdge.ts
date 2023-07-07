import { Str, Type } from '@dynafer/utils';
import Options from '../../../../Options';
import Editor from '../../../Editor';
import { CreateAdjustableEdgeSize, RegisterAdjustingEvents, StartAdjustment } from '../Utils';
import AdjustingNavigation from './AdjustingNavigation';
import { CreateFakeFigure, CreateFakeMedia, MakeAbsolute, ResetAbsolute } from './MediaToolsUtils';

const AdjustableEdge = (editor: Editor, media: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;

	const adjustableEdgeGroup = DOM.Create('div', {
		attrs: [Options.ATTRIBUTES.ADJUSTABLE_EDGE_GROUP],
	});

	const createCommonEdge = (type: 'west' | 'east', bLeft: boolean, bTop: boolean): HTMLElement => {
		const attrs: Record<string, string> = {};
		attrs[Options.ATTRIBUTES.ADJUSTABLE_EDGE] = type;
		attrs[Options.ATTRIBUTES.HORIZONTAL] = bLeft ? 'left' : 'right';
		attrs[Options.ATTRIBUTES.VERTICAL] = bTop ? 'top' : 'bottom';

		return DOM.Create('div', {
			attrs,
			styles: {
				left: CreateAdjustableEdgeSize(media.offsetLeft + (bLeft ? 0 : media.offsetWidth), true),
				top: CreateAdjustableEdgeSize(media.offsetTop + (bTop ? 0 : media.offsetHeight), true),
			},
		});
	};

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

	const startAdjusting = (event: MouseEvent | Touch, Figure: HTMLElement, FigureElement: HTMLElement) => {
		const adjustItem = event.target as HTMLElement;

		let startOffsetX = event.pageX;
		let startOffsetY = event.pageY;

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
		navigation.Update(event.pageX, event.pageY);

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

		const toggleWidth = !Str.IsEmpty(dumpWidth) ? DOM.SetStyle : DOM.RemoveStyle;
		const toggleHeight = !Str.IsEmpty(dumpHeight) ? DOM.SetStyle : DOM.RemoveStyle;
		toggleWidth(figureElement, 'width', dumpWidth);
		toggleHeight(figureElement, 'height', dumpHeight);

		updateEdgePosition(figureElement);

		self.ScrollSavedPosition();

		const lineGroup = DOM.Select<HTMLElement>({ attrs: [Options.ATTRIBUTES.ADJUSTABLE_LINE_GROUP] }, Figure);
		DOM.Hide(lineGroup);

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

			const figureSize = bHorizontal ? figureElement.offsetWidth : figureElement.offsetHeight;
			const minimumSize = bHorizontal ? minWidth : minHeight;
			const minimumOffset = bHorizontal ? minimumOffsetX : minimumOffsetY;
			const offsetDifference = bLeftOrTop ? minimumOffset - current : current - minimumOffset;

			if (figureSize + calculated > minimumSize && offsetDifference > 0) return calculated;

			DOM.SetStyle(figureElement, bHorizontal ? 'width' : 'height', `${bHorizontal ? minWidth : minHeight}px`);
			if ((bHorizontal && bLeft) || (!bHorizontal && bTop))
				DOM.SetStyle(figureElement, bHorizontal ? 'left' : 'top', `${bHorizontal ? minLeft : minTop}px`);

			return false;
		};

		const adjust = (e: MouseEvent | Touch) => {
			const currentOffsetX = e.pageX;
			const currentOffsetY = e.pageY;

			const calculatedX = isUpdatable(true, currentOffsetX);
			const calculatedY = isUpdatable(false, currentOffsetY);

			navigation.Update(e.pageX, e.pageY);

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

			if (!Type.IsBoolean(calculatedX)) updateSize('width', calculatedX, bLeft);
			if (!Type.IsBoolean(calculatedY)) updateSize('height', calculatedY, bTop);

			DOM.SetStyles(figureElement, newStyle);

			updateEdgePosition(figureElement);
		};

		const finishAdjusting = () => {
			DOM.Remove(fakeFigure.Figure);

			ResetAbsolute(self, Figure, figureElement);

			if (bIFrame) {
				DOM.Show(FigureElement);
				DOM.SetStyles(FigureElement, {
					width: DOM.GetStyle(figureElement, 'width'),
					height: DOM.GetStyle(figureElement, 'height'),
				});
				DOM.Remove(figureElement);
			}

			DOM.Show(lineGroup);

			navigation.Destory();
		};

		RegisterAdjustingEvents(self, FigureElement, adjust, finishAdjusting);
	};

	const edges = [leftTopEdge, rightTopEdge, leftBottomEdge, rightBottomEdge];
	StartAdjustment(self, startAdjusting, ...edges);
	DOM.Insert(adjustableEdgeGroup, ...edges);

	return adjustableEdgeGroup;
};

export default AdjustableEdge;