import { Attribute, NodeType } from '@dynafer/dom-control';
import { Arr, Obj, Str } from '@dynafer/utils';
import Editor from '../../Editor';
import DOMUtils from '../DOMUtils';
import Table from './Table';

interface IFoundFigure<T extends Element> {
	readonly Figure: HTMLElement | null,
	readonly FigureType: string | null,
	readonly FigureElement: T | null,
}

export interface IFigure {
	readonly Selector: string,
	readonly FigureTypeSetMap: Record<string, Set<string>>,
	readonly FigureTypeMap: Record<string, string>,
	HasType: (type: string) => boolean,
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
	Remove: (editor: Editor, target: Node) => void,
}

const Figure = (): IFigure => {
	const Selector = 'figure';

	const FigureTypeSetMap: Record<string, Set<string>> = {
		media: new Set(['img', 'audio', 'video', 'iframe']),
		table: new Set([Table.Selector]),
		hr: new Set(['hr']),
	};

	const FigureTypeMap: Record<string, string> = {
		media: Str.Join(',', ...FigureTypeSetMap.media),
		table: Table.Selector,
		hr: 'hr',
	};

	const HasType = (type: string): boolean => Arr.Contains(Obj.Keys(FigureTypeMap), type);

	const FindType = (type: string): string => {
		if (HasType(type)) return type;

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
		Attribute.SetMultiple(figure, {
			type: FindType(type),
			contenteditable: 'false',
		});
		return figure;
	};

	const SelectFigureElement = <T extends Element>(selector: EventTarget | Node | null): T | null => {
		if (!selector || !NodeType.IsElement(selector)) return null;
		const figureType = Attribute.Get(selector, 'type');
		if (!figureType) return null;

		return selector.querySelector<T>(!FigureTypeMap[figureType] ? figureType : FigureTypeMap[figureType]);
	};

	const Find = <T extends Element>(from: EventTarget | Node): IFoundFigure<T> => {
		const figure = NodeType.IsElement(from) ? from.closest(Selector) : null;
		const figureType = Attribute.Get(figure, 'type');
		const figureElement = SelectFigureElement<T>(figure);

		return {
			Figure: figure,
			FigureType: figureType,
			FigureElement: figureElement,
		};
	};

	const IsFigure = (selector?: Node | EventTarget | null): selector is HTMLElement =>
		!NodeType.IsNode(selector) ? false : DOMUtils.GetNodeName(selector) === Selector;

	const GetClosest = <T extends Node>(selector?: T | EventTarget | null): HTMLElement | T | null =>
		!NodeType.IsElement(selector) ? null : selector.closest(Selector);

	const Remove = (editor: Editor, target: Node) => {
		const self = editor;
		const DOM = self.DOM;

		const figure = GetClosest<HTMLElement>(target);
		if (!figure) return;

		const newRange = self.Utils.Range();

		if (figure.nextElementSibling) {
			const firstChild = DOM.Utils.GetFirstChild(figure.nextElementSibling, true);
			if (firstChild) newRange.SetStartToEnd(firstChild, 0, 0);
		} else if (figure.previousElementSibling) {
			const lastChild = DOM.Utils.GetLastChild(figure.previousElementSibling, true);
			const offset = NodeType.IsText(lastChild) ? lastChild.length : 0;
			if (lastChild) newRange.SetStartToEnd(lastChild, offset, offset);
		}

		DOM.Remove(figure, true);
		self.Utils.Caret.UpdateRange(newRange);
		self.Utils.Shared.DispatchCaretChange();
	};

	return {
		Selector,
		FigureTypeSetMap,
		FigureTypeMap,
		HasType,
		FindType,
		Create,
		SelectFigureElement,
		Find,
		IsFigure,
		GetClosest,
		Remove,
	};
};

export default Figure();