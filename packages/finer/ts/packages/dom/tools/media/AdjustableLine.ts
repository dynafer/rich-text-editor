import { Arr, Str } from '@dynafer/utils';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { ADJUSTABLE_LINE_HALF_SIZE, RegisterAdjustingEvents } from '../Utils';
import AdjustingNavigation from './AdjustingNavigation';
import { CreateFakeFigure, CreateFakeMedia, MakeAbsolute, ResetAbsolute } from './MediaToolsUtils';

const AdjustableLine = (editor: Editor, media: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;

	const adjustableLineGroup = DOM.Create('div', {
		attrs: ['data-adjustable-line-group'],
	});

	const createAdjustableLine = (type: 'left' | 'top' | 'right' | 'bottom'): HTMLElement => {
		const bHorizontal = type === 'left' || type === 'right';
		return DOM.Create('div', {
			attrs: {
				dataAdjustableLine: type,
			},
			styles: {
				width: `${bHorizontal ? ADJUSTABLE_LINE_HALF_SIZE : media.offsetWidth}px`,
				height: `${bHorizontal ? media.offsetHeight : ADJUSTABLE_LINE_HALF_SIZE}px`,
				left: `${media.offsetLeft + (type !== 'right' ? 0 : media.offsetWidth) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`,
				top: `${media.offsetTop + (type !== 'bottom' ? 0 : media.offsetHeight) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`,
			}
		});
	};

	const adjustableLeft = createAdjustableLine('left');
	const adjustableTop = createAdjustableLine('top');
	const adjustableRight = createAdjustableLine('right');
	const adjustableBottom = createAdjustableLine('bottom');

	const setLineStyles = (figureElement: HTMLElement, element: HTMLElement, type: 'left' | 'top' | 'right' | 'bottom') =>
		DOM.SetStyles(element, {
			width: `${type === 'left' || type === 'right' ? ADJUSTABLE_LINE_HALF_SIZE : figureElement.offsetWidth}px`,
			height: `${type === 'left' || type === 'right' ? figureElement.offsetHeight : ADJUSTABLE_LINE_HALF_SIZE}px`,
			left: `${figureElement.offsetLeft + (type !== 'right' ? 0 : figureElement.offsetWidth) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`,
			top: `${figureElement.offsetTop + (type !== 'bottom' ? 0 : figureElement.offsetHeight) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`,
		});

	const setAdjustableSizeAndPosition = (figureElement: HTMLElement) => {
		setLineStyles(figureElement, adjustableLeft, 'left');
		setLineStyles(figureElement, adjustableTop, 'top');
		setLineStyles(figureElement, adjustableRight, 'right');
		setLineStyles(figureElement, adjustableBottom, 'bottom');
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

		const bWidth = adjustItem === adjustableLeft || adjustItem === adjustableRight;
		const bPosition = adjustItem === adjustableLeft || adjustItem === adjustableTop;

		const sizeStyleName = bWidth ? 'width' : 'height';
		const positionStyleName = bWidth ? 'left' : 'top';

		const getPosition = (element: HTMLElement): number => bWidth ? element.offsetLeft : element.offsetTop;
		const getSize = (element: HTMLElement): number => bWidth ? element.offsetWidth : element.offsetHeight;

		const oldSize = getSize(figureElement);
		const oldPosition = getPosition(figureElement);

		self.SaveScrollPosition();

		const navigation = AdjustingNavigation(self, FigureElement, figureElement);
		navigation.Update(startOffsetX, startOffsetY);

		const fakeFigure = CreateFakeFigure(self, Figure, figureElement);
		DOM.InsertBefore(Figure, fakeFigure.Figure);

		MakeAbsolute(self, fakeFigure, Figure, figureElement);

		const dumpWidth = Str.IsEmpty(DOM.GetStyle(figureElement, 'width')) ? figureElement.offsetWidth : parseFloat(DOM.GetStyle(figureElement, 'width'));
		const dumpHeight = Str.IsEmpty(DOM.GetStyle(figureElement, 'height')) ? figureElement.offsetHeight : parseFloat(DOM.GetStyle(figureElement, 'height'));

		DOM.SetStyles(figureElement, {
			width: '0px',
			height: '0px',
		});

		const minSize = getSize(figureElement);
		const minPosition = getPosition(figureElement) + (bPosition ? Math.max(minSize - oldSize, oldSize - minSize) : 0);

		DOM.SetStyles(figureElement, {
			width: `${dumpWidth}px`,
			height: `${dumpHeight}px`,
		});

		self.ScrollSavedPosition();

		const edgeGroup = DOM.Select<HTMLElement>({ attrs: ['data-adjustable-edge-group'] }, Figure);
		DOM.Hide(edgeGroup);

		const setMinimumSize = () => {
			const newStyle: Record<string, string> = {};
			newStyle[sizeStyleName] = `${minSize}px`;
			newStyle[positionStyleName] = `${minPosition}px`;
			DOM.SetStyles(figureElement, newStyle);
			setAdjustableSizeAndPosition(figureElement);
		};

		const sizeDifference = bPosition ? 0 : (minSize - oldSize);
		const positionDifference = minPosition - oldPosition + sizeDifference;
		const savedOffsetPosition = (bWidth ? startOffsetX : startOffsetY) + positionDifference;
		let bUpdatable = true;

		const adjust = (e: MouseEvent) => {
			PreventEvent(e);

			const currentOffsetX = e.clientX;
			const currentOffsetY = e.clientY;

			navigation.Update(currentOffsetX, currentOffsetY);

			const startOffset = bWidth ? startOffsetX : startOffsetY;
			const currentOffset = bWidth ? currentOffsetX : currentOffsetY;

			const calculated = bPosition ? startOffset - currentOffset : currentOffset - startOffset;

			if (calculated === 0) return;

			startOffsetX = currentOffsetX;
			startOffsetY = currentOffsetY;

			const offsetDifference = bPosition ? savedOffsetPosition - currentOffset : currentOffset - savedOffsetPosition;

			const finish = () => {
				const newStyle: Record<string, string> = {};
				const newSize = getSize(figureElement) + calculated;
				newStyle[sizeStyleName] = `${newSize}px`;
				if (bPosition) newStyle[positionStyleName] = `${minPosition + minSize - newSize}px`;

				DOM.SetStyles(figureElement, newStyle);
				setAdjustableSizeAndPosition(figureElement);
			};

			if (!bUpdatable) {
				if (calculated < 0 || offsetDifference <= 0) return setMinimumSize();

				bUpdatable = true;
				return finish();
			}

			if (calculated < 0 && offsetDifference <= 0) {
				bUpdatable = false;
				return setMinimumSize();
			}

			finish();
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

			DOM.Show(edgeGroup);

			navigation.Destory();
		};

		RegisterAdjustingEvents(self, FigureElement, adjust, finishAdjusting);
	};

	const lines = [adjustableLeft, adjustableTop, adjustableRight, adjustableBottom];
	Arr.Each(lines, line => DOM.On(line, ENativeEvents.mousedown, startAdjusting));

	DOM.Insert(adjustableLineGroup, adjustableLeft, adjustableTop, adjustableRight, adjustableBottom);

	return adjustableLineGroup;
};

export default AdjustableLine;