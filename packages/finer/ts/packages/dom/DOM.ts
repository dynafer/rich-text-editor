import { Str, Type } from '@dynafer/utils';
import DOMUtils, { IDOMUtils } from './DOMUtils';

type TCreateOption = Record<string, string> | string[] | string | Element[];
type TElement = Node | Element | null;

export type TEventListener<K extends keyof GlobalEventHandlersEventMap> = (event: GlobalEventHandlersEventMap[K]) => void;

export interface IDom {
	Win: Window & typeof globalThis,
	Doc: Document,
	New: (win: Window & typeof globalThis, doc: Document) => IDom,
	Select: {
		<T extends Node>(selector: T, parent?: TElement): T;
		(selector: string, parent?: TElement): HTMLElement | null;
	},
	SelectAll: {
		<T extends Node>(selector: T, parent?: TElement): T[];
		(selector: string, parent?: TElement): HTMLElement[];
	},
	SetAttr: (selector: TElement, attr: string, value: string) => void,
	SetAttrs: (selector: TElement, attrs: Record<string, string>) => void,
	HasAttr: (selector: TElement, attr: string) => boolean,
	RemoveAttr: (selector: TElement, attr: string) => void,
	RemoveAttrs: (selector: TElement, attrs: string[]) => void,
	AddClass: (selector: TElement, ...classes: string[]) => void,
	HasClass: (selector: TElement, className: string) => boolean,
	RemoveClass: (selector: TElement, ...classes: string[]) => void,
	GetStyles: (selector: HTMLElement | null) => Record<string, string>,
	GetStyle: (selector: HTMLElement | null, styleName: string) => string,
	SetStyle: {
		<K extends keyof CSSStyleDeclaration>(selector: HTMLElement | null, name: K, value: string): void;
		(selector: HTMLElement | null, name: string, value: string): void;
	},
	SetStyles: {
		<K extends keyof CSSStyleDeclaration>(selector: HTMLElement | null, styles: Record<K, string>): void;
		(selector: HTMLElement | null, styles: Record<string, string>): void;
	},
	Insert: (selector: TElement, insertion: TElement | string) => void,
	InsertAfter: (selector: TElement, insertion: TElement | string) => void,
	GetTagName: {
		<K extends keyof HTMLElementTagNameMap>(selector: TElement): K;
		(selector: TElement): string;
	},
	GetParents: (selector: Node | null) => Node[],
	On: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TElement, eventName: K, event: TEventListener<K>): void;
		(selector: TElement, eventName: string, event: EventListener): void;
	},
	Dispatch: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TElement, eventName: K): void;
		(selector: TElement, eventName: string): void;
	},
	Show: (selector: HTMLElement, displayType?: string) => void,
	Hide: (selector: HTMLElement) => void,
	Create: {
		<K extends keyof HTMLElementTagNameMap>(tagName: K, option?: Record<string, TCreateOption>): HTMLElementTagNameMap[K];
		(tagName: string, option?: Record<string, TCreateOption>): HTMLElement;
	},
	Utils: IDOMUtils,
}

const DOM = (_win: Window & typeof globalThis = window, _doc: Document = document): IDom => {
	const Win: Window & typeof globalThis = _win;
	const Doc: Document = _doc;
	const elementType = Win.Element;
	const nodeType = Win.Node;

	const New = (win: Window & typeof globalThis, doc: Document): IDom => {
		return DOM(win, doc);
	};

	const Select = (selector: string, parent?: TElement): HTMLElement | null =>
		Type.IsInstance(parent, elementType) ? parent.querySelector(selector) : Doc.querySelector(selector);

	const SelectAll = (selector: string, parent?: TElement): HTMLElement[] =>
		Array.from(Type.IsInstance(parent, elementType) ? parent.querySelectorAll(selector) : Doc.querySelectorAll(selector));

	const SetAttr = (selector: TElement, attr: string, value: string) => {
		if (!(Type.IsInstance(selector, elementType) && Type.IsString(attr) && Type.IsString(value))) return;
		selector.setAttribute(Str.CapitalToDash(attr), value);
	};

	const SetAttrs = (selector: TElement, attrs: Record<string, string>) => {
		if (!Type.IsInstance(selector, elementType)) return;
		for (const [attr, value] of Object.entries(attrs)) {
			SetAttr(selector, attr, value);
		}
	};

	const HasAttr = (selector: TElement, attr: string): boolean => {
		if (!Type.IsInstance(selector, elementType)) return false;
		return selector.hasAttribute(attr);
	};

	const RemoveAttr = (selector: TElement, attr: string) => {
		if (!Type.IsInstance(selector, elementType) || !Type.IsString(attr)) return;
		selector.removeAttribute(Str.CapitalToDash(attr));
	};

	const RemoveAttrs = (selector: TElement, attrs: string[]) => {
		if (!Type.IsInstance(selector, elementType)) return;
		for (const attr of attrs) {
			RemoveAttr(selector, attr);
		}
	};

	const AddClass = (selector: TElement, ...classes: string[]) => {
		if (!Type.IsInstance(selector, elementType)) return;
		selector.classList.add(...classes);
	};

	const HasClass = (selector: TElement, className: string): boolean => {
		if (!Type.IsInstance(selector, elementType)) return false;
		return selector.classList.contains(className);
	};

	const RemoveClass = (selector:TElement, ...classes: string[]) => {
		if (!Type.IsInstance(selector, elementType)) return;
		selector.classList.remove(...classes);
	};

	const GetStyles = (selector: HTMLElement | null): Record<string, string> => {
		if (!Type.IsInstance(selector, elementType)) return {};

		const styleList = selector.style.cssText.split(';');
		const styleDict: Record<string, string> = {};
		for (const style of styleList) {
			const keyValue = style.split(':');
			styleDict[Str.DashToCapital(keyValue[0])] = keyValue[1].trim();
		}

		return styleDict;
	};

	const GetStyle = (selector: HTMLElement | null, styleName: string): string => {
		if (!Type.IsInstance(selector, elementType)) return '';

		const styles = GetStyles(selector);

		return styles[styleName] ?? '';
	};

	const SetStyle = (selector: HTMLElement | null, name: string, value: string) => {
		if (!Type.IsInstance(selector, elementType) || !Type.IsString(name) || !Type.IsString(value)) return;

		const styleList = selector.style.cssText.split(';');
		styleList.push(`${Str.CapitalToDash(name)}: ${value}`);
		selector.style.cssText = styleList.join(';');
	};

	const SetStyles = (selector: HTMLElement | null, styles: Record<string, string>) => {
		if (!Type.IsInstance(selector, elementType)) return;
		for (const [name, value] of Object.entries(styles)) {
			SetStyle(selector, name, value);
		}
	};

	const Insert = (selector: TElement, insertion: TElement | string) => {
		if (!Type.IsInstance(selector, elementType) || !(Type.IsElement(insertion) || Type.IsString(insertion))) return;

		if (Type.IsString(insertion))
			selector.insertAdjacentHTML('beforeend', insertion);
		else
			selector.insertAdjacentElement('beforeend', insertion);
	};

	const InsertAfter = (selector: TElement, insertion: TElement | string) => {
		if (!Type.IsInstance(selector, elementType) || !(Type.IsElement(insertion) || Type.IsString(insertion))) return;

		if (Type.IsString(insertion))
			selector.insertAdjacentHTML('afterend', insertion);
		else
			selector.insertAdjacentElement('afterend', insertion);
	};

	const GetTagName = (selector: TElement) => {
		if (!Type.IsInstance(selector, elementType)) return '';
		return selector.tagName.toLowerCase();
	};

	const GetParents = (selector: Node | null) => {
		if (!Type.IsInstance(selector, nodeType) || HasAttr(selector, 'contenteditable')) return [];
		const parents: Node[] = [];
		let parent: ParentNode | Node | null = selector;

		if (selector.nodeName !== '#text') parents.unshift(selector);

		while (parent = parent.parentNode) {
			if (!Type.IsInstance(selector, nodeType) || !parent || HasAttr(parent, 'contenteditable')) break;

			parents.unshift(parent);
		}

		return parents;
	};

	const On = (selector: TElement, eventName: string, event: EventListener) => {
		if (!(Type.IsInstance(selector, elementType) && Type.IsString(eventName))) return;
		selector.addEventListener(eventName, event);
	};

	const Dispatch = (selector: TElement, eventName: string) => {
		if (!(Type.IsInstance(selector, elementType) && Type.IsString(eventName))) return;
		const customEvent = new CustomEvent(eventName);

		selector.dispatchEvent(customEvent);
	};

	const Show = (selector: HTMLElement, displayType: string = 'block') => {
		if (!Type.IsInstance(selector, elementType) || !Type.IsString(displayType)) return;
		SetStyle(selector, 'display', displayType);
	};

	const Hide = (selector: HTMLElement) => {
		if (!Type.IsInstance(selector, elementType)) return;
		SetStyle(selector, 'display', 'none');
	};

	const Create = (tagName: string, option?: Record<string, TCreateOption>) => {
		const newElement = Doc.createElement(tagName);
		if (!option) return newElement;

		if (option.attrs && Type.IsObject(option.attrs)) SetAttrs(newElement, option.attrs as Record<string, string>);
		if (option.styles && Type.IsObject(option.styles)) SetStyles(newElement, option.styles as Record<string, string>);

		if (option.class && Type.IsString(option.class)) newElement.className = option.class as string;
		else if (option.class && Type.IsArray(option.class)) AddClass(newElement, ...option.class as string[]);

		if (option.html && Type.IsString(option.html)) newElement.innerHTML = option.html;
		if (option.children && Type.IsArray(option.children)) {
			for (const child of option.children) {
				if (!Type.IsInstance(child, elementType)) continue;
				Insert(newElement, child);
			}
		}

		return newElement;
	};

	const Utils: IDOMUtils = DOMUtils;

	return {
		Win,
		Doc,
		New,
		Select,
		SelectAll,
		SetAttr,
		SetAttrs,
		HasAttr,
		RemoveAttr,
		RemoveAttrs,
		AddClass,
		HasClass,
		RemoveClass,
		GetStyles,
		GetStyle,
		SetStyle,
		SetStyles,
		Insert,
		InsertAfter,
		GetTagName,
		GetParents,
		On,
		Dispatch,
		Show,
		Hide,
		Create,
		Utils,
	};
};

export default DOM();