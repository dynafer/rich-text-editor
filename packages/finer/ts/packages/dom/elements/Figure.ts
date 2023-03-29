import { NodeType } from '@dynafer/dom-control';
import { Arr, Obj, Str } from '@dynafer/utils';
import DOMUtils from '../DOMUtils';
import Table from './Table';

interface IFoundFigure<T extends Element> {
	Figure: HTMLElement | null,
	FigureType: string | null,
	FigureElement: T | null,
}

export interface IFigure {
	readonly Selector: string,
	readonly FigureTypeSetMap: Record<string, Set<string>>,
	readonly FigureTypeMap: Record<string, string>,
	FindType: (type: string) => string,
	Create: (type: string) => HTMLElement,
	SelectFigureElement: {
		<T extends Element>(from: EventTarget | Node | null): T | null;
		(from: EventTarget | Node | null): Element | null;
	},
	Find: {
		<T extends Element>(from: EventTarget | Node): IFoundFigure<T>;
		(from: EventTarget | Node): IFoundFigure<Element>;
	},
	IsFigure: (selector?: Node | EventTarget | null) => selector is HTMLElement,
	GetClosest: <T extends Node>(selector?: T | EventTarget | null) => HTMLElement | T | null,
}

const Figure = (): IFigure => {
	const Selector = 'figure';

	const FigureTypeSetMap: Record<string, Set<string>> = {
		media: new Set(['img', 'audio', 'video', 'iframe']),
		table: new Set([Table.Selector]),
	};

	const FigureTypeMap: Record<string, string> = {
		media: Str.Join(',', ...FigureTypeSetMap.media),
		table: Table.Selector,
	};

	const FindType = (type: string): string => {
		if (Arr.Contains(Object.keys(FigureTypeMap), type)) return type;

		let foundType = type;
		Obj.Entries(FigureTypeSetMap, (typeKey, typeSet, exit) => {
			if (!typeSet.has(type)) return;
			foundType = typeKey;
			exit();
		});

		return foundType;
	};

	const Create = (type: string): HTMLElement => {
		const figure = document.createElement(Selector);
		figure.setAttribute('type', FindType(type));
		figure.contentEditable = 'false';
		return figure;
	};

	const SelectFigureElement = <T extends Element>(selector: EventTarget | Node | null): T | null => {
		if (!selector || !NodeType.IsElement(selector)) return null;
		const figureType = selector.getAttribute('type');
		if (!figureType) return null;

		return selector.querySelector<T>(!FigureTypeMap[figureType] ? figureType : FigureTypeMap[figureType]);
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
		found.FigureElement = SelectFigureElement<T>(found.Figure);

		return found;
	};

	const IsFigure = (selector?: Node | EventTarget | null): selector is HTMLElement =>
		!NodeType.IsNode(selector) ? false : DOMUtils.GetNodeName(selector) === Selector;

	const GetClosest = <T extends Node>(selector?: T | EventTarget | null): HTMLElement | T | null =>
		!NodeType.IsElement(selector) ? null : selector.closest(Selector);

	return {
		Selector,
		FigureTypeSetMap,
		FigureTypeMap,
		FindType,
		Create,
		SelectFigureElement,
		Find,
		IsFigure,
		GetClosest,
	};
};

export default Figure();