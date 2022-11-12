import { Str, Type, Instance, Arr } from '@dynafer/utils';
import DOMUtils, { IDOMUtils } from './DOMUtils';

const ESCAPE_EMPTY_TEXT_REGEX = /(%EF%BB%BF|%0A)/gi;

type TElement = Node | Element | null;

export type TCreateOption = Record<string, string> | string[] | string | TElement[] | (string | TElement)[];
export type TEventListener<K extends keyof GlobalEventHandlersEventMap> = (event: GlobalEventHandlersEventMap[K]) => void;

export interface IDom {
	Win: Window & typeof globalThis,
	Doc: Document,
	New: (win: Window & typeof globalThis, doc: Document) => IDom,
	GetRoot: () => HTMLElement,
	Select: {
		<T extends Element>(selector: T | string, parent?: TElement): T;
		(selector: string, parent?: TElement): HTMLElement | null;
	},
	SelectAll: {
		<T extends Element>(selector: T, parent?: TElement): T[];
		(selector: string, parent?: TElement): HTMLElement[];
	},
	GetAttr: (selector: TElement, attr: string) => string | null,
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
	GetText: (selector: HTMLElement) => string,
	GetHTML: (selector: HTMLElement) => string,
	SetText: (selector: HTMLElement, text: string) => void,
	SetHTML: (selector: HTMLElement, html: string) => void,
	SetOuterHTML: (selector: HTMLElement, html: string) => void,
	Insert: (selector: TElement, insertion: TElement | Node[] | string) => void,
	InsertAfter: (selector: TElement, insertion: TElement | Node[]  | string) => void,
	Clone: (selector: TElement, deep?: boolean, insertion?: TElement | Node[]) => Node | null,
	GetTagName: {
		<K extends keyof HTMLElementTagNameMap>(selector: TElement): K;
		(selector: TElement): string;
	},
	IsEditable: (selector: Node) => boolean,
	GetParents: (selector: Node | null, bReverse?: boolean) => Node[],
	On: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TElement, eventName: K, event: TEventListener<K>): void;
		(selector: TElement, eventName: string, event: EventListener): void;
	},
	Off: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TElement, eventName: K, event?: TEventListener<K>): void;
		(selector: TElement, eventName: string, event?: EventListener): void;
	},
	Dispatch: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TElement, eventName: K): void;
		(selector: TElement, eventName: string): void;
	},
	Show: (selector: HTMLElement, displayType?: string) => void,
	Hide: (selector: HTMLElement) => void,
	IsHidden: (selector: HTMLElement) => boolean,
	Create: {
		<K extends keyof HTMLElementTagNameMap>(tagName: K, option?: Record<string, TCreateOption>): HTMLElementTagNameMap[K];
		(tagName: string, option?: Record<string, TCreateOption>): HTMLElement;
	},
	RemoveChildren: (selector: Element | null, bBubble?: boolean) => void,
	Remove: (selector: Element | null, bBubble?: boolean) => void,
	Utils: IDOMUtils,
}

const DOM = (_win: Window & typeof globalThis = window, _doc: Document = document): IDom => {
	const Win: Window & typeof globalThis = _win;
	const Doc: Document = _doc;
	const Utils: IDOMUtils = DOMUtils;

	const elementType = Win.Element;
	const nodeType = Win.Node;

	const bindedEvents: [Element, string, EventListener][] = [];

	const New = (win: Window & typeof globalThis, doc: Document): IDom => DOM(win, doc);

	const GetRoot = (): HTMLElement => Doc.documentElement;

	const Select = (selector: string, parent?: TElement): HTMLElement | null =>
		Instance.Is(parent, elementType) ? parent.querySelector(selector) : Doc.querySelector(selector);

	const SelectAll = (selector: string, parent?: TElement): HTMLElement[] =>
		Array.from(Instance.Is(parent, elementType) ? parent.querySelectorAll(selector) : Doc.querySelectorAll(selector));

	const GetAttr = (selector: TElement, attr: string): string | null =>
		!Instance.Is(selector, elementType) || !Type.IsString(attr) ? null : selector.getAttribute(attr);

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

	const HasAttr = (selector: TElement, attr: string): boolean =>
		!Instance.Is(selector, elementType) ? false : selector.hasAttribute(attr);

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

	const HasClass = (selector: TElement, className: string): boolean =>
		!Instance.Is(selector, elementType) ? false : selector.classList.contains(className);

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
			if (keyValue.length !== 2) continue;
			styleDict[Str.DashToCapital(keyValue[0])] = keyValue[1].trim();
		}

		return styleDict;
	};

	const GetStyle = (selector: HTMLElement | null, styleName: string): string => {
		if (!Instance.Is(selector, elementType)) return '';

		const styles = GetStyles(selector);
		if (Object.keys(styles).length === 0) {
			const computedStyle = Win.getComputedStyle(selector);
			return computedStyle[Str.CapitalToDash(styleName)];
		}

		return styles[Str.CapitalToDash(styleName)];
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

	const GetText = (selector: HTMLElement): string =>
		!Instance.Is(selector, elementType) ? '' : encodeURI(selector.innerText).replace(ESCAPE_EMPTY_TEXT_REGEX, '');

	const GetHTML = (selector: HTMLElement): string =>
		!Instance.Is(selector, elementType) ? '' : decodeURI(encodeURI(selector.innerHTML).replace(ESCAPE_EMPTY_TEXT_REGEX, ''));

	const SetText = (selector: HTMLElement, text: string) => {
		if (!Instance.Is(selector, elementType)) return;
		selector.innerText = text;
	};

	const SetHTML = (selector: HTMLElement, html: string) => {
		if (!Instance.Is(selector, elementType)) return;
		selector.innerHTML = html;
	};

	const SetOuterHTML = (selector: HTMLElement, html: string) => {
		if (!Instance.Is(selector, elementType)) return;
		selector.outerHTML = html;
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

	const GetTagName = (selector: TElement): string =>
		!Instance.Is(selector, elementType) ? '' : selector.tagName.toLowerCase();

	const IsEditable = (selector: Node): boolean =>
		HasAttr(selector, 'contenteditable');

	const GetParents = (selector: Node | null, bReverse: boolean = false): Node[] => {
		if (!Instance.Is(selector, nodeType) || IsEditable(selector)) return [];
		const parents: Node[] = [];
		const add = bReverse ? Arr.Push : Arr.Unshift;
		let parent: ParentNode | Node | null = selector;

		if (selector.nodeName !== '#text') add(parents, selector);

		while (parent = parent.parentNode) {
			if (!Instance.Is(selector, nodeType) || !Instance.Is(parent, nodeType) || IsEditable(parent)) break;

			add(parents, parent);
		}

		return parents;
	};

	const On = (selector: TElement, eventName: string, event: EventListener) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(eventName)) return;
		selector.addEventListener(eventName, event);
		bindedEvents.push([ selector, eventName, event ]);
	};

	const Off = (selector: TElement, eventName: string, event?: EventListener) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(eventName)) return;
		let deletedCount = 0;
		for (let index = 0, length = bindedEvents.length; index < length; ++ index) {
			const [ target, name, bindedEvent ] = bindedEvents[index - deletedCount];
			if (target === selector && eventName === name && (!event || (event && event === bindedEvent))) {
				target.removeEventListener(name, bindedEvent);
				bindedEvents.splice(index - deletedCount, 1);
				++ deletedCount;
			}
		}
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

	const IsHidden = (selector: HTMLElement): boolean =>
		!Instance.Is(selector, elementType) ? false : GetStyle(selector, 'display') === 'none';

	const Create = (tagName: string, option?: Record<string, TCreateOption>): HTMLElement => {
		const newElement = Doc.createElement(tagName);
		if (!option) return newElement;

		if (option.attrs && Type.IsObject(option.attrs)) SetAttrs(newElement, option.attrs as Record<string, string>);
		if (option.styles && Type.IsObject(option.styles)) SetStyles(newElement, option.styles as Record<string, string>);

		if (option.class && Type.IsString(option.class)) newElement.className = option.class;
		else if (option.class && Type.IsArray(option.class)) AddClass(newElement, ...option.class as string[]);

		if (option.html && Type.IsString(option.html)) SetHTML(newElement, option.html);
		if (option.children && Type.IsArray(option.children)) {
			for (const child of option.children) {
				if (!Instance.Is(child, elementType) && !Instance.Is(child, nodeType) && !Type.IsString(child)) continue;
				Insert(newElement, child);
			}
		}

		return newElement;
	};

	const RemoveChildren = (selector: Element | null, bBubble: boolean = false) => {
		if (!Instance.Is(selector, elementType)) return;
		if (Arr.IsEmpty(Array.from(selector.children))) return;
		for (const child of selector.children) {
			for (const [ target, eventName, event ] of bindedEvents) {
				if (target === child) Off(target, eventName, event);
			}
		}

		if (bBubble) {
			for (const child of selector.children) {
				RemoveChildren(child, bBubble);
				child.remove();
			}
		}
	};

	const Remove = (selector: Element | null, bBubble: boolean = false) => {
		if (!Instance.Is(selector, elementType)) return;
		for (const [ target, eventName, event ] of bindedEvents) {
			if (target === selector) Off(target, eventName, event);
		}

		if (bBubble) RemoveChildren(selector, bBubble);

		selector.remove();
	};

	return {
		Win,
		Doc,
		New,
		GetRoot,
		Select,
		SelectAll,
		GetAttr,
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
		GetText,
		GetHTML,
		SetText,
		SetHTML,
		SetOuterHTML,
		Insert,
		InsertAfter,
		Clone,
		GetTagName,
		IsEditable,
		GetParents,
		On,
		Off,
		Dispatch,
		Show,
		Hide,
		IsHidden,
		Create,
		RemoveChildren,
		Remove,
		Utils,
	};
};

export default DOM();