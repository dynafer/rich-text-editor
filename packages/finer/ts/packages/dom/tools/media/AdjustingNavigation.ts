import { Formula } from '@dynafer/utils';
import Editor from '../../../Editor';
import DOM from '../../DOM';

const AdjustingNavigation = (editor: Editor, media: HTMLElement, fakeMedia: HTMLElement) => {
	const self = editor;

	const NAVIGATION_MARGIN = 20;

	const getFrameOffset = (type: 'left' | 'top'): number =>
		self.IsIFrame()
			? (type === 'left' ? self.Frame.Wrapper.offsetLeft : self.Frame.Wrapper.offsetTop)
			: 0;

	const navigation = DOM.Create('div', {
		class: DOM.Utils.CreateUEID('media-size-navigation', false),
	});

	const getOriginalSize = (type: 'width' | 'height') => {
		const bWidth = type === 'width';
		if (DOM.Utils.IsImage(media)) return bWidth ? media.naturalWidth : media.naturalHeight;
		if (DOM.Utils.IsVideo(media)) return bWidth ? media.videoWidth : media.videoHeight;
		return parseFloat(self.DOM.GetAttr(media, `data-original-${type}`) ?? '0');
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
		let calculatedLeft = offsetX + getFrameOffset('left') + DOM.Win.scrollX + NAVIGATION_MARGIN;
		let calculatedTop = offsetY + getFrameOffset('top') + DOM.Win.scrollY + NAVIGATION_MARGIN;
		if (calculatedLeft + navigation.offsetWidth >= DOM.Win.innerWidth)
			calculatedLeft -= navigation.offsetWidth + NAVIGATION_MARGIN;

		if (calculatedTop + navigation.offsetHeight >= DOM.Win.innerHeight)
			calculatedTop -= navigation.offsetHeight + NAVIGATION_MARGIN;

		DOM.SetStyles(navigation, {
			left: `${calculatedLeft}px`,
			top: `${calculatedTop}px`
		});

		DOM.SetHTML(navigation, getMediaInfo());
	};

	DOM.Insert(DOM.Doc.body, navigation);

	const Remove = () => DOM.Remove(navigation);

	return {
		Update,
		Remove,
	};
};

export default AdjustingNavigation;