import { Arr } from '@dynafer/utils';
import Editor from 'finer/packages/Editor';
import { IMAGE_MENU_ADDABLE_TOP } from '../utils/Utils';

const MediaMenuEvents = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const getMediaMenu = (target: HTMLElement): HTMLElement | null => {
		const { Figure, FigureType } = DOM.Element.Figure.Find<HTMLElement>(target);
		if (!Figure || FigureType !== 'media') return null;

		return DOM.Select<HTMLElement>({ attrs: ['data-media-menu'] }, Figure);
	};

	const getAdjustEvent = (type: 'start' | 'finish') =>
		(target: HTMLElement) => {
			const mediaMenu = getMediaMenu(target);
			if (!mediaMenu) return;
			const toggle = type === 'start' ? DOM.Hide : DOM.Show;
			toggle(mediaMenu);
		};

	const scrollEvent = () =>
		Arr.Each(DOM.SelectAll<HTMLElement>({ attrs: ['data-media-menu'] }, self.GetBody()), mediaMenu => {
			const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(mediaMenu);
			if (!Figure || !FigureElement) return;

			const yRange = DOM.Win.innerHeight + DOM.Win.scrollY;
			const predictMenuBottomSide = Figure.offsetTop + Figure.offsetHeight + mediaMenu.offsetHeight;

			const position = predictMenuBottomSide <= yRange
				? `${FigureElement.offsetTop + FigureElement.offsetHeight + IMAGE_MENU_ADDABLE_TOP}px`
				: `${FigureElement.offsetTop - mediaMenu.offsetHeight - IMAGE_MENU_ADDABLE_TOP}px`;

			DOM.SetStyle(mediaMenu, 'top', position);
		});

	const Register = () => {
		self.On('Adjust:Start', getAdjustEvent('start'));
		self.On('Adjust:Finish', getAdjustEvent('finish'));
		DOM.On(DOM.Win, Finer.NativeEventMap.scroll, scrollEvent);
	};

	return {
		Register
	};
};

export default MediaMenuEvents;