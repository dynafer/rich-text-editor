import { Formula } from '@dynafer/utils';
import Options from '../../../../Options';
import DOM from '../../../dom/DOM';
import Editor from '../../../Editor';

const STANDARD_IFRAME_WIDTH = 560;
const STANDARD_IFRAME_HEIGHT = 315;

const AdjustingNavigation = (editor: Editor, media: HTMLElement, fakeMedia: HTMLElement) => {
	const self = editor;

	const NAVIGATION_MARGIN = 20;

	const getFrameOffset = (type: 'left' | 'top'): number =>
		self.IsIFrame()
			? (type === 'left' ? self.Frame.Wrapper.offsetLeft : self.Frame.Wrapper.offsetTop)
			: 0;

	const navigation = DOM.Create('div', {
		class: DOM.Utils.CreateUEID('parts-size-navigation', false),
	});

	const getOriginalSize = (type: 'width' | 'height'): number => {
		const bWidth = type === 'width';
		if (DOM.Utils.IsImage(media)) return bWidth ? media.naturalWidth : media.naturalHeight;
		if (DOM.Utils.IsVideo(media)) return bWidth ? media.videoWidth : media.videoHeight;
		const standard = bWidth ? STANDARD_IFRAME_WIDTH : STANDARD_IFRAME_HEIGHT;
		const originalName = bWidth ? Options.ATTRIBUTES.ORIGINAL_WIDTH : Options.ATTRIBUTES.ORIGINAL_HEIGHT;
		const originalSize = parseFloat(DOM.GetAttr(media, originalName) ?? '0');
		return originalSize === 0 ? standard : originalSize;
	};

	const originalWidth = getOriginalSize('width');
	const originalHeight = getOriginalSize('height');

	const getMediaInfo = (): string => {
		const ratioWidth = Formula.RoundDecimal(fakeMedia.offsetWidth / originalWidth);
		const ratioHeight = Formula.RoundDecimal(fakeMedia.offsetHeight / originalHeight);
		const ratio = `${ratioWidth} : ${ratioHeight}`;
		return `R. ${ratio}<br>W. ${fakeMedia.offsetWidth}px<br> H. ${fakeMedia.offsetHeight}px`;
	};

	const Update = (offsetX: number, offsetY: number) => {
		let calculatedLeft = offsetX + getFrameOffset('left') - self.GetWin().scrollX + NAVIGATION_MARGIN;
		let calculatedTop = offsetY + getFrameOffset('top') - self.GetWin().scrollY + NAVIGATION_MARGIN;
		if (calculatedLeft + navigation.offsetWidth >= self.GetWin().innerWidth)
			calculatedLeft -= navigation.offsetWidth + NAVIGATION_MARGIN;

		if (calculatedTop + navigation.offsetHeight >= self.GetWin().innerHeight)
			calculatedTop -= navigation.offsetHeight + NAVIGATION_MARGIN;

		DOM.SetStyles(navigation, {
			left: `${calculatedLeft}px`,
			top: `${calculatedTop}px`
		});

		DOM.SetHTML(navigation, getMediaInfo());
	};

	DOM.Insert(DOM.Doc.body, navigation);

	const Destory = () => DOM.Remove(navigation);

	return {
		Update,
		Destory,
	};
};

export default AdjustingNavigation;