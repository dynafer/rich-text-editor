import { Arr } from '@dynafer/utils';
import Editor from 'finer/packages/Editor';
import { IMAGE_MENU_ADDABLE_TOP } from '../utils/Utils';

const ImageMenuEvents = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const getImageMenu = (target: HTMLElement): HTMLElement | null => {
		const { Figure, FigureType } = DOM.Element.Figure.Find<HTMLElement>(target);
		if (!Figure || FigureType !== 'img') return null;

		return DOM.Select<HTMLElement>({ attrs: ['data-image-menu'] }, Figure);
	};

	const getAdjustEvent = (type: 'start' | 'finish') =>
		(target: HTMLElement) => {
			const imageMenu = getImageMenu(target);
			if (!imageMenu) return;
			const toggle = type === 'start' ? DOM.Hide : DOM.Show;
			toggle(imageMenu);
		};

	const scrollEvent = () =>
		Arr.Each(DOM.SelectAll<HTMLElement>({ attrs: ['data-image-menu'] }, self.GetBody()), imageMenu => {
			const { Figure } = DOM.Element.Figure.Find<HTMLElement>(imageMenu);
			if (!Figure) return;

			const image = DOM.Select<HTMLElement>('img', Figure);

			const yRange = DOM.Win.innerHeight + DOM.Win.scrollY;
			const predictMenuBottomSide = Figure.offsetTop + Figure.offsetHeight + imageMenu.offsetHeight;

			const position = predictMenuBottomSide <= yRange
				? `${image.offsetTop + image.offsetHeight + IMAGE_MENU_ADDABLE_TOP}px`
				: `${image.offsetTop - imageMenu.offsetHeight - IMAGE_MENU_ADDABLE_TOP}px`;

			DOM.SetStyle(imageMenu, 'top', position);
		});

	const Register = () => {
		self.On('adjust:start', getAdjustEvent('start'));
		self.On('adjust:finish', getAdjustEvent('finish'));
		DOM.On(DOM.Win, Finer.NativeEventMap.scroll, scrollEvent);
	};

	return {
		Register
	};
};

export default ImageMenuEvents;