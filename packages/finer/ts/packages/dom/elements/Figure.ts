import { NodeType } from '@dynafer/dom-control';
import DOMUtils from '../DOMUtils';

interface IFoundFigure<T extends Element> {
	Figure: HTMLElement | null,
	FigureType: string | null,
	FigureElement: T | null,
}

export interface IFigure {
	readonly Selector: string,
	Create: (type: string) => HTMLElement,
	Find: {
		<T extends Element>(from: EventTarget | Node): IFoundFigure<T>;
		(from: EventTarget | Node): IFoundFigure<Element>;
	},
	IsFigure: <T extends Node>(selector?: T | EventTarget | null) => boolean,
	GetClosest: <T extends Node>(selector?: T | EventTarget | null) => HTMLElement | T | null,
}

const Figure = (): IFigure => {
	const Selector = 'figure';

	const Create = (type: string): HTMLElement => {
		const figure = document.createElement(Selector);
		figure.setAttribute('type', type);
		figure.contentEditable = 'false';
		return figure;
	};

	const Find = <T extends Element>(from: EventTarget | Node): IFoundFigure<T> => {
		const found: IFoundFigure<T> = {
			Figure: null,
			FigureType: null,
			FigureElement: null,
		};

		if (!NodeType.IsElement(from)) return found;

		found.Figure = from.closest(Selector);
		found.FigureType = found.Figure?.getAttribute('type') ?? null;
		found.FigureElement = !!found.Figure && !!found.FigureType
			? found.Figure.querySelector<T>(found.FigureType)
			: null;

		return found;
	};

	const IsFigure = <T extends Node>(selector?: T | EventTarget | null): boolean =>
		!NodeType.IsNode(selector) ? false : DOMUtils.GetNodeName(selector) === Selector;

	const GetClosest = <T extends Node>(selector?: T | EventTarget | null): HTMLElement | T | null =>
		!NodeType.IsElement(selector) ? null : selector.closest(Selector);

	return {
		Selector,
		Create,
		Find,
		IsFigure,
		GetClosest,
	};
};

export default Figure();