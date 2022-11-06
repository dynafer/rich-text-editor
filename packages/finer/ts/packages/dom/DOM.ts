import { Str, Type, Instance, Arr } from '@dynafer/utils';
import DOMUtils, { IDOMUtils } from './DOMUtils';

const emptyRegex = /%EF%BB%BF/gi;

type TElement = Node | Element | null;

export type TCreateOption = Record<string, string> | string[] | string | TElement[];
export type TEventListener<K extends keyof GlobalEventHandlersEventMap> = (event: GlobalEventHandlersEventMap[K]) => void;

export interface IDom {
	Win: Window & typeof globalThis,
	Doc: Document,
	New: (win: Window & typeof globalThis, doc: Document) => IDom,
	Select: {
		<T extends Node>(selector: T | string, parent?: TElement): T;
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
	HasStyle: (selector: HTMLElement | null, styleName: string, compareValue?: string) => boolean,
	Insert: (selector: TElement, insertion: TElement | Node[] | string) => void,
	InsertAfter: (selector: TElement, insertion: TElement | Node[]  | string) => void,
	Clone: (selector: TElement, deep?: boolean, insertion?: TElement | Node[]) => Node | null,
	GetTagName: {
		<K extends keyof HTMLElementTagNameMap>(selector: TElement): K;
		(selector: TElement): string;
	},
	GetParents: (selector: Node | null, bReverse?: boolean) => Node[],
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
	GetInnerText: (selector: HTMLElement) => string,
	Create: {
		<K extends keyof HTMLElementTagNameMap>(tagName: K, option?: Record<string, TCreateOption>): HTMLElementTagNameMap[K];
		(tagName: string, option?: Record<string, TCreateOption>): HTMLElement;
	},
	Utils: IDOMUtils,
}

const DOM = (_win: Window & typeof globalThis = window, _doc: Document = document): IDom => {
	const Win: Window & typeof globalThis = _win;
	const Doc: Document = _doc;
	const Utils: IDOMUtils = DOMUtils;

	const elementType = Win.Element;
	const nodeType = Win.Node;

	const New = (win: Window & typeof globalThis, doc: Document): IDom => {
		return DOM(win, doc);
	};

	const Select = (selector: string, parent?: TElement): HTMLElement | null =>
		Instance.Is(parent, elementType) ? parent.querySelector(selector) : Doc.querySelector(selector);

	const SelectAll = (selector: string, parent?: TElement): HTMLElement[] =>
		Array.from(Instance.Is(parent, elementType) ? parent.querySelectorAll(selector) : Doc.querySelectorAll(selector));

	const SetAttr = (selector: TElement, attr: string, value: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(attr) || !Type.IsString(value)) return;
		selector.setAttribute(Str.CapitalToDash(attr), value);
	};

	const SetAttrs = (selector: TElement, attrs: Record<string, string>) => {
		if (!Instance.Is(selector, elementType)) return;
		for (const [attr, value] of Object.entries(attrs)) {
			SetAttr(selector, attr, value);
		}
	};

	const HasAttr = (selector: TElement, attr: string): boolean => {
		if (!Instance.Is(selector, elementType)) return false;
		return selector.hasAttribute(attr);
	};

	const RemoveAttr = (selector: TElement, attr: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(attr)) return;
		selector.removeAttribute(Str.CapitalToDash(attr));
	};

	const RemoveAttrs = (selector: TElement, attrs: string[]) => {
		if (!Instance.Is(selector, elementType)) return;
		for (const attr of attrs) {
			RemoveAttr(selector, attr);
		}
	};

	const AddClass = (selector: TElement, ...classes: string[]) => {
		if (!Instance.Is(selector, elementType)) return;
		selector.classList.add(...classes);
	};

	const HasClass = (selector: TElement, className: string): boolean => {
		if (!Instance.Is(selector, elementType)) return false;
		return selector.classList.contains(className);
	};

	const RemoveClass = (selector:TElement, ...classes: string[]) => {
		if (!Instance.Is(selector, elementType)) return;
		selector.classList.remove(...classes);
	};

	const GetStyles = (selector: HTMLElement | null): Record<string, string> => {
		if (!Instance.Is(selector, elementType)) return {};

		const styleList = selector.style.cssText.split(';');
		const styleDict: Record<string, string> = {};
		for (const style of styleList) {
			const keyValue = style.split(':');
			styleDict[Str.DashToCapital(keyValue[0])] = keyValue[1].trim();
		}

		return styleDict;
	};

	const GetStyle = (selector: HTMLElement | null, styleName: string): string => {
		if (!Instance.Is(selector, elementType)) return '';

		const styles = GetStyles(selector);

		return styles[styleName];
	};

	const SetStyle = (selector: HTMLElement | null, name: string, value: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(name) || !Type.IsString(value)) return;

		const styleList = selector.style.cssText.split(';');
		styleList.push(`${Str.CapitalToDash(name)}: ${value}`);
		selector.style.cssText = styleList.join(';');
	};

	const SetStyles = (selector: HTMLElement | null, styles: Record<string, string>) => {
		if (!Instance.Is(selector, elementType)) return;
		for (const [name, value] of Object.entries(styles)) {
			SetStyle(selector, name, value);
		}
	};

	const HasStyle = (selector: HTMLElement | null, styleName: string, compareValue?: string): boolean => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(styleName)) return false;

		const cssText = selector.style.cssText.replace(/\s*:\s*/gi, ':');
		if (compareValue) {
			if (!Type.IsString(compareValue)) return false;
			return cssText.includes(`${Str.CapitalToDash(styleName)}:${compareValue.trim()}`);
		}
		return cssText.includes(Str.CapitalToDash(styleName));
	};

	const Insert = (selector: TElement, insertion: TElement | Node[] | string) => {
		if (!Instance.Is(selector, elementType)
			|| (
				!Instance.Is(insertion, elementType)
				&& !Instance.Is(insertion, nodeType)
				&& !Type.IsArray(insertion)
				&& !Type.IsString(insertion)
			)
		) return;

		if (Instance.Is(insertion, elementType))
			selector.insertAdjacentElement('beforeend', insertion);
		else if (Instance.Is(insertion, nodeType))
			selector.appendChild(insertion);
		else if (Type.IsArray(insertion))
			selector.append(...insertion);
		else
			selector.insertAdjacentHTML('beforeend', insertion);
	};

	const InsertAfter = (selector: TElement, insertion: TElement | Node[] | string) => {
		if (!Instance.Is(selector, elementType)
			|| (
				!Instance.Is(insertion, elementType)
				&& !Instance.Is(insertion, nodeType)
				&& !Type.IsString(insertion)
				&& !Type.IsArray(insertion)
			)
		) return;

		if (Instance.Is(insertion, elementType))
			selector.insertAdjacentElement('afterend', insertion);
		else if (Instance.Is(insertion, nodeType))
			selector.after(insertion);
		else if (Type.IsArray(insertion))
			selector.after(...insertion);
		else
			selector.insertAdjacentHTML('afterend', insertion);
	};

	const Clone = (selector: TElement, deep?: boolean, insertion?: TElement | Node[]): Node | null => {
		if (!Instance.Is(selector, elementType) && !Instance.Is(selector, nodeType)) return null;
		if (deep && !Type.IsBoolean(deep)) return null;
		if (insertion
			&& (
				!Instance.Is(insertion, elementType)
				&& !Instance.Is(insertion, nodeType)
				&& !Type.IsArray(insertion)
			)
		) return null;

		const clonedSelector = selector.cloneNode(deep);
		if (insertion) Insert(clonedSelector, insertion);

		return clonedSelector;
	};

	const GetTagName = (selector: TElement) => {
		if (!Instance.Is(selector, elementType)) return '';
		return selector.tagName.toLowerCase();
	};

	const GetParents = (selector: Node | null, bReverse: boolean = false) => {
		if (!Instance.Is(selector, nodeType) || HasAttr(selector, 'contenteditable')) return [];
		const parents: Node[] = [];
		const add = bReverse ? Arr.Push : Arr.Unshift;
		let parent: ParentNode | Node | null = selector;

		if (selector.nodeName !== '#text') add(parents, selector);

		while (parent = parent.parentNode) {
			if (!Instance.Is(selector, nodeType) || !Instance.Is(parent, nodeType) || HasAttr(parent, 'contenteditable')) break;

			add(parents, parent);
		}

		return parents;
	};

	const On = (selector: TElement, eventName: string, event: EventListener) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(eventName)) return;
		selector.addEventListener(eventName, event);
	};

	const Dispatch = (selector: TElement, eventName: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(eventName)) return;
		const customEvent = new CustomEvent(eventName);

		selector.dispatchEvent(customEvent);
	};

	const Show = (selector: HTMLElement, displayType: string = 'block') => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(displayType)) return;
		SetStyle(selector, 'display', displayType);
	};

	const Hide = (selector: HTMLElement) => {
		if (!Instance.Is(selector, elementType)) return;
		SetStyle(selector, 'display', 'none');
	};

	const GetInnerText = (selector: HTMLElement): string => {
		if (!Instance.Is(selector, elementType)) return '';
		return encodeURI(selector.innerText).replace(emptyRegex, '');
	};

	const Create = (tagName: string, option?: Record<string, TCreateOption>) => {
		const newElement = Doc.createElement(tagName);
		if (!option) return newElement;

		if (option.attrs && Type.IsObject(option.attrs)) SetAttrs(newElement, option.attrs as Record<string, string>);
		if (option.styles && Type.IsObject(option.styles)) SetStyles(newElement, option.styles as Record<string, string>);

		if (option.class && Type.IsString(option.class)) newElement.className = option.class;
		else if (option.class && Type.IsArray(option.class)) AddClass(newElement, ...option.class as string[]);

		if (option.html && Type.IsString(option.html)) newElement.innerHTML = option.html;
		if (option.children && Type.IsArray(option.children)) {
			for (const child of option.children) {
				if (!Instance.Is(child, elementType) && !Instance.Is(child, nodeType)) continue;
				Insert(newElement, child);
			}
		}

		return newElement;
	};

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
		HasStyle,
		Insert,
		InsertAfter,
		Clone,
		GetTagName,
		GetParents,
		On,
		Dispatch,
		Show,
		Hide,
		GetInnerText,
		Create,
		Utils,
	};
};

export default DOM();