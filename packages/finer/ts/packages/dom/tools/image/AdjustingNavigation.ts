import { Formula } from '@dynafer/utils';
import Editor from '../../../Editor';
import DOM from '../../DOM';

const AdjustingNavigation = (editor: Editor, image: HTMLImageElement) => {
	const self = editor;

	const NAVIGATION_MARGIN = 20;

	const getFrameOffset = (type: 'left' | 'top'): number =>
		self.IsIFrame()
			? (type === 'left' ? self.Frame.Wrapper.offsetLeft : self.Frame.Wrapper.offsetTop)
			: 0;

	const navigation = DOM.Create('div', {
		class: DOM.Utils.CreateUEID('image-size-navigation', false),
	});

	const getImageInfo = (): string => {
		const ratioWidth = Formula.RoundDecimal(image.offsetWidth / image.naturalWidth);
		const ratioHeight = Formula.RoundDecimal(image.offsetHeight / image.naturalHeight);
		const ratio = `${ratioWidth} : ${ratioHeight}`;
		return `R. ${ratio}<br>W. ${image.offsetWidth}px<br> H. ${image.offsetHeight}px`;
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

		DOM.SetHTML(navigation, getImageInfo());
	};

	DOM.Insert(DOM.Doc.body, navigation);

	const Remove = () => DOM.Remove(navigation);

	return {
		Update,
		Remove,
	};
};

export default AdjustingNavigation;