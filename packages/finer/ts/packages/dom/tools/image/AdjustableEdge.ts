import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { CreateAdjustableEdgeSize, RegisterAdjustingEvents } from '../Utils';

const AdjustableEdge = (editor: Editor, image: HTMLImageElement): HTMLElement => {
	const self = editor;
	const rootDOM = self.GetRootDOM();
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

		const originalWidth = image.naturalWidth;
		const originalHeight = image.naturalHeight;

		const oldWidth = image.offsetWidth;
		const oldHeight = image.offsetHeight;

		self.SaveScrollPosition();

		const navigationMargin = 20;
		const navigationAddableLeft = self.IsIFrame() ? self.Frame.Wrapper.offsetLeft : 0;
		const navigationAddableTop = self.IsIFrame() ? self.Frame.Wrapper.offsetTop : 0;

		const navigation = rootDOM.Create('div', {
			class: DOM.Utils.CreateUEID('image-size-navigation', false),
		});

		const getImageInfo = (): string => {
			const ratio = `${Math.round(image.offsetWidth / originalWidth * 100) / 100} : ${Math.round(image.offsetHeight / originalHeight * 100) / 100}`;
			return `R. ${ratio}<br>W. ${image.offsetWidth}px<br> H. ${image.offsetHeight}px`;
		};

		const updateNavigation = (offsetX: number, offsetY: number) => {
			let calculatedLeft = offsetX + navigationAddableLeft + rootDOM.Win.scrollX + navigationMargin;
			let calculatedTop = offsetY + navigationAddableTop + rootDOM.Win.scrollY + navigationMargin;
			if (calculatedLeft + navigation.offsetWidth >= rootDOM.Win.innerWidth)
				calculatedLeft -= navigation.offsetWidth + navigationMargin;

			if (calculatedTop + navigation.offsetHeight >= rootDOM.Win.innerHeight)
				calculatedTop -= navigation.offsetHeight + navigationMargin;

			rootDOM.SetStyles(navigation, {
				left: `${calculatedLeft}px`,
				top: `${calculatedTop}px`
			});

			rootDOM.SetHTML(navigation, getImageInfo());
		};

		updateNavigation(startOffsetX, startOffsetY);

		rootDOM.Insert(rootDOM.Doc.body, navigation);

		const fakeSizedFigure = DOM.Clone(figure) as HTMLElement;
		DOM.SetStyles(fakeSizedFigure, {
			position: 'relative',
			width: `${figure.offsetWidth}px`,
			height: `${figure.offsetHeight}px`,
		});

		const fakeSizedImage = DOM.Create('div', {
			attrs: {
				dataFake: ''
			}
		});
		DOM.SetStyles(fakeSizedImage, {
			width: `${oldWidth}px`,
			height: `${oldHeight}px`
		});

		DOM.Insert(fakeSizedFigure, fakeSizedImage);
		DOM.InsertBefore(figure, fakeSizedFigure);
		DOM.SetStyles(figure, {
			position: 'absolute',
			left: '0px',
			top: '0px',
		});

		const dumpWidth = DOM.GetStyle(image, 'width');
		const dumpHeight = DOM.GetStyle(image, 'height');
		DOM.SetStyles(image, {
			width: '0px',
			height: '0px',
		});

		const minWidth = image.offsetWidth;
		const minHeight = image.offsetHeight;
		const minLeft = image.offsetLeft + Math.max(0, oldWidth - minWidth);
		const minTop = image.offsetTop + Math.max(0, oldHeight - minHeight);

		updateEdgePosition();
		const savedAdjustItemLeft = adjustItem.offsetLeft + (bLeft ? Math.max(0, oldWidth - minWidth) : 0);
		const savedAdjustItemTop = adjustItem.offsetTop + (bTop ? Math.max(0, oldHeight - minHeight) : 0);

		const toggleWidth = !Str.IsEmpty(dumpWidth) ? DOM.SetStyle : DOM.RemoveStyle;
		const toggleHeight = !Str.IsEmpty(dumpHeight) ? DOM.SetStyle : DOM.RemoveStyle;
		toggleWidth(image, 'width', dumpWidth);
		toggleHeight(image, 'height', dumpHeight);

		updateEdgePosition();

		self.ScrollSavedPosition();

		const lineGroup = DOM.Select<HTMLElement>({ attrs: ['data-adjustable-line-group'] }, figure);
		DOM.Hide(lineGroup);

		let lastAdjustOffsetX = -1;
		let lastAdjustOffsetY = -1;

		DOM.SetStyles(figure, {
			position: 'absolute',
			left: `${fakeSizedFigure.offsetLeft + parseFloat(DOM.GetStyle(fakeSizedImage, 'margin-left', true)) - parseFloat(DOM.GetStyle(fakeSizedFigure, 'margin-left', true))}px`,
			top: `${fakeSizedFigure.offsetTop + parseFloat(DOM.GetStyle(fakeSizedImage, 'margin-top', true)) - parseFloat(DOM.GetStyle(fakeSizedFigure, 'margin-top', true))}px`,
		});

		const bFigureRight = DOM.HasStyle(figure, 'float', 'right')
			|| (DOM.HasStyle(figure, 'margin-left', 'auto') && !DOM.HasStyle(figure, 'margin-right', 'auto'));

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

				const imagePosition = bHorizontal ? image.offsetLeft : image.offsetTop;
				DOM.SetStyle(image, bHorizontal ? 'left' : 'top', `${imagePosition}px`);

				updateEdgePosition();

				return false;
			}

			const bSave = calculated < 0 && bUnderPosition;
			if (bSave) {
				if (bHorizontal) lastAdjustOffsetX = current + difference;
				else lastAdjustOffsetY = current + difference;

				const imagePosition = bHorizontal ? image.offsetLeft : image.offsetTop;
				DOM.SetStyle(image, bHorizontal ? 'left' : 'top', `${imagePosition}px`);

				updateEdgePosition();

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

			if ((Type.IsBoolean(calculatedX) && !calculatedX) && (Type.IsBoolean(calculatedY) && !calculatedY))
				return updateNavigation(currentOffsetX, currentOffsetY);

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

			updateNavigation(currentOffsetX, currentOffsetY);

			updateEdgePosition();
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);

			DOM.RemoveStyle(image, 'left');
			DOM.RemoveStyle(image, 'top');
			fakeSizedFigure.remove();

			DOM.RemoveStyle(figure, 'position');
			DOM.RemoveStyle(figure, 'left');
			DOM.RemoveStyle(figure, 'top');
			DOM.Show(lineGroup);

			rootDOM.Remove(navigation);
		};

		RegisterAdjustingEvents(self, adjust, finishAdjusting);
	};

	const edges = [leftTopEdge, rightTopEdge, leftBottomEdge, rightBottomEdge];
	Arr.Each(edges, edge => DOM.On(edge, ENativeEvents.mousedown, startAdjusting));

	DOM.Insert(adjustableEdgeGroup, ...edges);

	return adjustableEdgeGroup;
};

export default AdjustableEdge;