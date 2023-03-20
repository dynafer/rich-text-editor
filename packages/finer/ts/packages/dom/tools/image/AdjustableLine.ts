import { Arr, Str } from '@dynafer/utils';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { ADJUSTABLE_LINE_HALF_SIZE, GetClientSize, RegisterAdjustingEvents } from '../Utils';
import AdjustingNavigation from './AdjustingNavigation';
import { CreateFakeFigure, MakeAbsolute, ResetAbsolute } from './ImageToolsUtils';

const AdjustableLine = (editor: Editor, image: HTMLImageElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;

	const adjustableLineGroup = DOM.Create('div', {
		attrs: {
			dataAdjustableLineGroup: '',
		},
	});

	const figure = image.parentNode as HTMLElement;

	const createAdjustableLine = (type: 'left' | 'top' | 'right' | 'bottom'): HTMLElement => {
		const bHorizontal = type === 'left' || type === 'right';
		return DOM.Create('div', {
			attrs: {
				dataAdjustableLine: type,
			},
			styles: {
				width: `${bHorizontal ? ADJUSTABLE_LINE_HALF_SIZE : GetClientSize(self, image, 'width')}px`,
				height: `${bHorizontal ? GetClientSize(self, image, 'height') : ADJUSTABLE_LINE_HALF_SIZE}px`,
				left: `${image.offsetLeft + (type !== 'right' ? 0 : image.offsetWidth) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`,
				top: `${image.offsetTop + (type !== 'bottom' ? 0 : image.offsetHeight) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`,
			}
		});
	};

	const adjustableLeft = createAdjustableLine('left');
	const adjustableTop = createAdjustableLine('top');
	const adjustableRight = createAdjustableLine('right');
	const adjustableBottom = createAdjustableLine('bottom');

	const setLineStyles = (element: HTMLElement, type: 'left' | 'top' | 'right' | 'bottom') =>
		DOM.SetStyles(element, {
			width: `${type === 'left' || type === 'right' ? ADJUSTABLE_LINE_HALF_SIZE : GetClientSize(self, image, 'width')}px`,
			height: `${type === 'left' || type === 'right' ? GetClientSize(self, image, 'height') : ADJUSTABLE_LINE_HALF_SIZE}px`,
			left: `${image.offsetLeft + (type !== 'right' ? 0 : image.offsetWidth) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`,
			top: `${image.offsetTop + (type !== 'bottom' ? 0 : image.offsetHeight) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`,
		});

	const setAdjustableSizeAndPosition = () => {
		setLineStyles(adjustableLeft, 'left');
		setLineStyles(adjustableTop, 'top');
		setLineStyles(adjustableRight, 'right');
		setLineStyles(adjustableBottom, 'bottom');
	};

	const startAdjusting = (event: MouseEvent) => {
		PreventEvent(event);

		const adjustItem = event.target as HTMLElement;

		const bWidth = adjustItem === adjustableLeft || adjustItem === adjustableRight;
		const bPosition = adjustItem === adjustableLeft || adjustItem === adjustableTop;

		const sizeStyleName = bWidth ? 'width' : 'height';
		const positionStyleName = bWidth ? 'left' : 'top';

		const getPosition = (element: HTMLElement): number => bWidth ? element.offsetLeft : element.offsetTop;
		const getSize = (element: HTMLElement): number => bWidth ? element.offsetWidth : element.offsetHeight;

		let startOffsetX = event.clientX;
		let startOffsetY = event.clientY;

		const oldSize = getSize(image);
		const oldPosition = getPosition(image);

		self.SaveScrollPosition();

		const navigation = AdjustingNavigation(self, image);
		navigation.Update(startOffsetX, startOffsetY);

		const fakeFigure = CreateFakeFigure(self, figure, image);
		DOM.InsertBefore(figure, fakeFigure.Figure);

		MakeAbsolute(self, fakeFigure, figure, image);

		const dumpWidth = Str.IsEmpty(DOM.GetStyle(image, 'width')) ? image.offsetWidth : parseFloat(DOM.GetStyle(image, 'width'));
		const dumpHeight = Str.IsEmpty(DOM.GetStyle(image, 'height')) ? image.offsetHeight : parseFloat(DOM.GetStyle(image, 'height'));

		DOM.SetStyles(image, {
			width: '0px',
			height: '0px',
		});

		const minSize = getSize(image);
		const minPosition = getPosition(image) + (bPosition ? Math.max(minSize - oldSize, oldSize - minSize) : 0);

		DOM.SetStyles(image, {
			width: `${dumpWidth}px`,
			height: `${dumpHeight}px`,
		});

		self.ScrollSavedPosition();

		const edgeGroup = DOM.Select<HTMLElement>({ attrs: ['data-adjustable-edge-group'] }, figure);
		DOM.Hide(edgeGroup);

		const setMinimumSize = () => {
			const newStyle: Record<string, string> = {};
			newStyle[sizeStyleName] = `${minSize}px`;
			newStyle[positionStyleName] = `${minPosition}px`;
			DOM.SetStyles(image, newStyle);
			setAdjustableSizeAndPosition();
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

			if (!bUpdatable) {
				if (calculated < 0 || offsetDifference <= 0) return setMinimumSize();

				bUpdatable = true;
			} else {
				if (calculated < 0 && offsetDifference <= 0) {
					bUpdatable = false;
					return setMinimumSize();
				}
			}

			const newStyle: Record<string, string> = {};
			const newSize = getSize(image) + calculated;
			newStyle[sizeStyleName] = `${newSize}px`;
			if (bPosition) newStyle[positionStyleName] = `${minPosition + minSize - newSize}px`;

			DOM.SetStyles(image, newStyle);
			setAdjustableSizeAndPosition();
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);

			fakeFigure.Figure.remove();

			ResetAbsolute(self, figure, image);

			DOM.Show(edgeGroup);

			navigation.Remove();
		};

		RegisterAdjustingEvents(self, adjust, finishAdjusting);
	};

	const lines = [adjustableLeft, adjustableTop, adjustableRight, adjustableBottom];
	Arr.Each(lines, line => DOM.On(line, ENativeEvents.mousedown, startAdjusting));

	DOM.Insert(adjustableLineGroup, adjustableLeft, adjustableTop, adjustableRight, adjustableBottom);

	return adjustableLineGroup;
};

export default AdjustableLine;