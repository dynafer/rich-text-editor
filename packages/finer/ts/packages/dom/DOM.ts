import { Attribute, Style } from '@dynafer/dom-control';
import { Str, Type, Instance, Arr } from '@dynafer/utils';
import Options from '../../Options';
import DOMUtils, { IDOMUtils } from './DOMUtils';

const ESCAPE_EMPTY_TEXT_REGEX = /(%EF%BB%BF|%0A)/gi;

type TElement = Node | Element | null;

export type TCreateOption = Record<string, string> | string[] | string | TElement[] | (string | TElement)[];
export type TEventListener<K extends keyof GlobalEventHandlersEventMap> = (event: GlobalEventHandlersEventMap[K]) => void;

export interface IDom {
	Win: Window & typeof globalThis,
	Doc: Document,
	New: (win: Window & typeof globalThis, doc: Document, bEditor: boolean) => IDom,
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
	GetStyleText: (selector: HTMLElement | null) => string,
	GetStyles: (selector: HTMLElement | null) => Record<string, string>,
	GetStyle: (selector: HTMLElement | null, name: string, bComputed?: boolean) => string,
	SetStyleText: (selector: HTMLElement | null, styleText: string) => void,
	SetStyle: {
		<K extends keyof CSSStyleDeclaration>(selector: HTMLElement | null, name: K, value: string): void;
		(selector: HTMLElement | null, name: string, value: string): void;
	},
	SetStyles: {
		<K extends keyof CSSStyleDeclaration>(selector: HTMLElement | null, styles: Record<K, string>): void;
		(selector: HTMLElement | null, styles: Record<string, string>): void;
	},
	RemoveStyle: (selector: HTMLElement | null, name: string) => void,
	HasStyle: (selector: HTMLElement | null, name: string, compareValue?: string) => boolean,
	GetText: (selector: HTMLElement) => string,
	GetHTML: (selector: HTMLElement) => string,
	SetText: (selector: HTMLElement, text: string) => void,
	SetHTML: (selector: HTMLElement, html: string) => void,
	SetOuterHTML: (selector: HTMLElement, html: string) => void,
	Insert: (selector: TElement, insertion: TElement | Node[] | string) => void,
	InsertAfter: (selector: TElement, insertion: TElement | Node[] | string) => void,
	Clone: (selector: TElement, deep?: boolean, insertion?: TElement | Node[]) => Node | null,
	Closest: (selector: Element | null, find: string) => Element | null,
	ClosestByStyle: (selector: Element | null, styles: string | string[] | Record<string, string>) => Element | null,
	GetTagName: {
		<K extends keyof HTMLElementTagNameMap>(selector: TElement): K;
		(selector: TElement): string;
	},
	IsEditable: (selector: Node) => boolean,
	GetParents: (selector: Node | null, bReverse?: boolean) => Node[],
	On: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TElement, eventName: K, event: TEventListener<K>): void;
		(selector: (Window & typeof globalThis) | TElement, eventName: string, event: EventListener): void;
	},
	Off: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TElement, eventName: K, event?: TEventListener<K>): void;
		(selector: (Window & typeof globalThis) | TElement, eventName: string, event?: EventListener): void;
	},
	OffAll: (selector: (Window & typeof globalThis) | TElement) => void,
	Dispatch: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TElement, eventName: K): void;
		(selector: TElement, eventName: string): void;
	},
	Show: (selector: HTMLElement, displayType?: string) => void,
	Hide: (selector: HTMLElement) => void,
	IsHidden: (selector: HTMLElement) => boolean,
	CreateFragment: () => DocumentFragment,
	Create: {
		<K extends keyof HTMLElementTagNameMap>(tagName: K, option?: Record<string, TCreateOption>): HTMLElementTagNameMap[K];
		(tagName: string, option?: Record<string, TCreateOption>): HTMLElement;
	},
	RemoveChildren: (selector: Element | null, bBubble?: boolean) => void,
	Remove: (selector: Element | null, bBubble?: boolean) => void,
	Utils: IDOMUtils,
}

const DOM = (_win: Window & typeof globalThis = window, _doc: Document = document, bFromEditor: boolean = false): IDom => {
	const Win: Window & typeof globalThis = _win;
	const Doc: Document = _doc;
	const Utils: IDOMUtils = DOMUtils;

	const elementType = Win.Element;
	const nodeType = Win.Node;

	const boundEvents: [(Window & typeof globalThis) | Element, string, EventListener][] = [];

	const New = (win: Window & typeof globalThis, doc: Document, bEditor: boolean): IDom => DOM(win, doc, bEditor);

	const GetRoot = (): HTMLElement => Doc.documentElement;

	const Select = (selector: string, parent?: TElement): HTMLElement | null =>
		Instance.Is(parent, elementType) ? parent.querySelector(selector) : Doc.querySelector(selector);

	const SelectAll = (selector: string, parent?: TElement): HTMLElement[] =>
		Array.from(Instance.Is(parent, elementType) ? parent.querySelectorAll(selector) : Doc.querySelectorAll(selector));

	const GetAttr = (selector: TElement, attr: string): string | null =>
		!Instance.Is(selector, elementType) || !Type.IsString(attr) ? null : Attribute.Get(selector, attr);

	const SetAttr = (selector: TElement, attr: string, value: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(attr) || !Type.IsString(value)) return;
		Attribute.Set(selector, attr, value);
	};

	const SetAttrs = (selector: TElement, attrs: Record<string, string>) => {
		if (!Instance.Is(selector, elementType)) return;
		for (const [attr, value] of Object.entries(attrs)) {
			SetAttr(selector, attr, value);
		}
	};

	const HasAttr = (selector: TElement, attr: string): boolean =>
		!Instance.Is(selector, elementType) ? false : Attribute.Has(selector, attr);

	const RemoveAttr = (selector: TElement, attr: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(attr)) return;
		Attribute.Remove(selector, attr);
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

	const RemoveClass = (selector: TElement, ...classes: string[]) => {
		if (!Instance.Is(selector, elementType)) return;
		selector.classList.remove(...classes);
	};

	const GetStyleText = (selector: HTMLElement | null): string =>
		!Instance.Is(selector, elementType) ? '' : Style.GetText(selector);

	const GetStyles = (selector: HTMLElement | null): Record<string, string> =>
		!Instance.Is(selector, elementType) ? {} : Style.GetAsMap(selector);

	const GetStyle = (selector: HTMLElement | null, name: string, bComputed?: boolean): string =>
		!Instance.Is(selector, elementType) ? '' : Style.Get(selector, name, bComputed);

	const SetStyleText = (selector: HTMLElement | null, styleText: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(styleText)) return;
		Style.SetText(selector, styleText);
	};

	const SetStyle = (selector: HTMLElement | null, name: string, value: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(name) || !Type.IsString(value)) return;
		Style.Set(selector, name, value);
		if (bFromEditor) SetAttr(selector, Options.EDITOR_STYLE_ATTRIBUTE, GetStyleText(selector));
	};

	const SetStyles = (selector: HTMLElement | null, styles: Record<string, string>) => {
		if (!Instance.Is(selector, elementType)) return;
		Style.SetAsMap(selector, styles);
		if (bFromEditor) SetAttr(selector, Options.EDITOR_STYLE_ATTRIBUTE, GetStyleText(selector));
	};

	const RemoveStyle = (selector: HTMLElement | null, name: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(name)) return;
		Style.Remove(selector, name);
		if (bFromEditor) {
			if (Str.IsEmpty(GetStyleText(selector))) return RemoveAttr(selector, Options.EDITOR_STYLE_ATTRIBUTE);
			SetAttr(selector, Options.EDITOR_STYLE_ATTRIBUTE, GetStyleText(selector));
		}
	};

	const HasStyle = (selector: HTMLElement | null, name: string, compareValue?: string): boolean =>
		!Instance.Is(selector, elementType) || !Type.IsString(name) ? false : Style.Has(selector, name, compareValue);

	const GetText = (selector: HTMLElement): string =>
		!Instance.Is(selector, elementType) ? '' : decodeURI(encodeURI(selector.innerText).replace(ESCAPE_EMPTY_TEXT_REGEX, ''));

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
		if ((!Instance.Is(selector, elementType) && !Instance.Is(selector, nodeType))
			|| (
				!Instance.Is(insertion, elementType)
				&& !Instance.Is(insertion, nodeType)
				&& !Type.IsArray(insertion)
				&& !Type.IsString(insertion)
			)
		) return;

		if (Instance.Is(selector, elementType)) {
			if (Instance.Is(insertion, elementType) || Instance.Is(insertion, nodeType))
				selector.appendChild(insertion);
			else if (Type.IsArray(insertion))
				selector.append(...insertion);
			else
				selector.insertAdjacentHTML('beforeend', insertion);
			return;
		}

		if (Type.IsArray(insertion))
			for (const insert of insertion) {
				selector.appendChild(insert);
			}
		else
			selector.appendChild(Type.IsString(insertion) ? new Text(insertion) : insertion);
	};

	const InsertAfter = (selector: TElement, insertion: TElement | Node[] | string) => {
		if (!Instance.Is(selector, elementType) && !Instance.Is(selector, nodeType)
			|| (
				!Instance.Is(insertion, elementType)
				&& !Instance.Is(insertion, nodeType)
				&& !Type.IsString(insertion)
				&& !Type.IsArray(insertion)
			)
		) return;

		if (Instance.Is(selector, elementType)) {
			if (Instance.Is(insertion, elementType) || Instance.Is(insertion, nodeType))
				selector.after(insertion);
			else if (Type.IsArray(insertion))
				selector.after(...insertion);
			else
				selector.insertAdjacentHTML('afterend', insertion);
			return;
		}

		if (Type.IsArray(insertion))
			(selector as ChildNode).after(...insertion);
		else
			(selector as ChildNode).after(insertion);
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

	const Closest = (selector: Element | null, find: string): Element | null => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(find) || Str.IsEmpty(find)) return null;
		return selector.closest(find);
	};

	const ClosestByStyle = (selector: Element | null, styles: string | string[] | Record<string, string>): Element | null => {
		if (!Instance.Is(selector, elementType)) return null;

		const createClosestStyleFormat = (style: string) => `[style*="${style}"]`;
		let find: string = '';

		if (Type.IsString(styles)) {
			find = createClosestStyleFormat(styles);
		} else if (Type.IsArray(styles)) {
			for (const style of styles) {
				find += createClosestStyleFormat(style);
			}
		} else if (Type.IsObject(styles)) {
			for (const [key, value] of Object.entries(styles)) {
				find += createClosestStyleFormat(`${key}${Str.IsEmpty(value) ? '' : `: ${value}`}`);
			}
		} else {
			return null;
		}

		return Closest(selector, find);
	};

	const GetTagName = (selector: TElement): string =>
		!Instance.Is(selector, elementType) ? '' : Str.LowerCase(selector.tagName);

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

	const On = (selector: (Window & typeof globalThis) | TElement, eventName: string, event: EventListener) => {
		if ((selector !== Win && !Instance.Is(selector, elementType)) || !Type.IsString(eventName)) return;
		selector.addEventListener(eventName, event);
		boundEvents.push([selector, eventName, event]);
	};

	const off = (isSame: (bound: [Element | (Window & typeof globalThis), string, EventListener]) => boolean) => {
		let deletedCount = 0;
		for (let index = 0, length = boundEvents.length; index < length; ++index) {
			const bound = boundEvents[index - deletedCount];
			if (!isSame(bound)) continue;

			const [target, eventName, event] = bound;
			target.removeEventListener(eventName, event);
			boundEvents.splice(index, 1);
			++deletedCount;
		}
	};

	const Off = (selector: (Window & typeof globalThis) | TElement, eventName: string, event?: EventListener) => {
		if ((selector !== Win && !Instance.Is(selector, elementType)) || !Type.IsString(eventName)) return;
		const isSame = (bound: [Element | (Window & typeof globalThis), string, EventListener]): boolean =>
			selector === bound[0] && eventName === bound[1] && (!event || (event && event === bound[2]));

		off(isSame);
	};

	const OffAll = (selector: (Window & typeof globalThis) | TElement) => {
		if (selector !== Win && !Instance.Is(selector, elementType)) return;
		const isSame = (bound: [Element | (Window & typeof globalThis), string, EventListener]): boolean =>
			selector === bound[0];

		off(isSame);
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

	const CreateFragment = (): DocumentFragment => Doc.createDocumentFragment();

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
		const children = Array.from(selector.children);
		if (Arr.IsEmpty(children)) return;
		for (const child of children) {
			OffAll(child);
		}

		if (bBubble) {
			for (const child of children) {
				RemoveChildren(child, bBubble);
				child.remove();
			}
		}
	};

	const Remove = (selector: Element | null, bBubble: boolean = false) => {
		if (!Instance.Is(selector, elementType)) return;
		OffAll(selector);

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
		GetStyleText,
		GetStyles,
		GetStyle,
		SetStyleText,
		SetStyle,
		SetStyles,
		RemoveStyle,
		HasStyle,
		GetText,
		GetHTML,
		SetText,
		SetHTML,
		SetOuterHTML,
		Insert,
		InsertAfter,
		Clone,
		Closest,
		ClosestByStyle,
		GetTagName,
		IsEditable,
		GetParents,
		On,
		Off,
		OffAll,
		Dispatch,
		Show,
		Hide,
		IsHidden,
		CreateFragment,
		Create,
		RemoveChildren,
		Remove,
		Utils,
	};
};

export default DOM();