import { Str, Type } from 'dynafer/utils';
import DOMUtils, { IDOMUtils } from 'finer/packages/dom/DOMUtils';

type TCreateOption = Record<string, string> | string[] | string | Element[];

export interface IDom {
	Doc: Document,
	Select: {
		<T extends Node>(selector: T, parent?: Element): T;
		(selector: string, parent?: Element): HTMLElement | null;
	},
	SelectAll: {
		<T extends Node>(selector: T, parent?: Element): T[];
		(selector: string, parent?: Element): HTMLElement[];
	},
	SetAttr: (selector: Element, attr: string, value: string, force?: boolean) => void,
	SetAttrs: (selector: Element, attrs: Record<string, string>, force?: boolean) => void,
	HasAttr: (selector: Element, attr: string) => boolean,
	RemoveAttr: (selector: Element, attr: string) => void,
	RemoveAttrs: (selector: Element, attrs: string[]) => void,
	SetStyle: {
		<K extends keyof CSSStyleDeclaration>(selector: HTMLElement, name: K, value: string): void;
		(selector: HTMLElement, name: string, value: string): void;
	},
	SetStyles: {
		<K extends keyof CSSStyleDeclaration>(selector: HTMLElement, styles: Record<K, string>): void;
		(selector: HTMLElement, styles: Record<string, string>): void;
	},
	Insert: (selector: Element, insertion: Element | string) => void,
	InsertAfter: (selector: Element, insertion: Element | string) => void,
	GetTagName: {
		<K extends keyof HTMLElementTagNameMap>(selector: Element): K;
		(selector: Element): string;
	},
	GetParents: (selector: Element) => Element[],
	On: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: Element, eventName: K, event: GlobalEventHandlersEventMap[K]): void;
		(selector: Element, eventName: string, event: EventListener): void;
	},
	Dispatch: (selector: Element, eventName: string, detail?: object) => void,
	Show: (selector: HTMLElement, displayType?: string) => void,
	Hide: (selector: HTMLElement) => void,
	Create: {
		<K extends keyof HTMLElementTagNameMap>(tagName: K, option?: Record<string, TCreateOption>): HTMLElementTagNameMap[K];
		(tagName: string, option?: Record<string, TCreateOption>): HTMLElement;
	},
	Utils: IDOMUtils,
}

const DOM = (doc: Document = document): IDom => {
	const Doc: Document = doc;

	const Select = (selector: string, parent?: Element): HTMLElement | null =>
		Type.IsElement(parent) ? parent.querySelector(selector) : doc.querySelector(selector);

	const SelectAll = (selector: string, parent?: Element): HTMLElement[] =>
		Array.from(Type.IsElement(parent) ? parent.querySelectorAll(selector) : doc.querySelectorAll(selector));

	const SetAttr = (selector: Element, attr: string, value: string, force: boolean = false) => {
		if (!(Type.IsElement(selector) || Type.IsString(attr) || Type.IsString(value)) && !force) return;
		selector.setAttribute(Str.CapitalToDash(attr), value);
	};

	const SetAttrs = (selector: Element, attrs: Record<string, string>, force: boolean = false) => {
		if (!Type.IsElement(selector) && !force) return;
		for (const [attr, value] of Object.entries(attrs)) {
			SetAttr(selector, attr, value, force);
		}
	};

	const HasAttr = (selector: Element, attr: string): boolean => {
		if (!Type.IsElement(selector)) return false;
		return selector.hasAttribute(attr);
	};

	const RemoveAttr = (selector: Element, attr: string) => {
		if (!Type.IsElement(selector) || !Type.IsString(attr)) return;
		selector.removeAttribute(Str.CapitalToDash(attr));
	};

	const RemoveAttrs = (selector: Element, attrs: string[]) => {
		if (!Type.IsElement(selector)) return;
		for (const attr of attrs) {
			RemoveAttr(selector, attr);
		}
	};

	const SetStyle = (selector: HTMLElement, name: string, value: string) => {
		if (!Type.IsElement(selector) || !Type.IsString(name) || !Type.IsString(value)) return;
		selector.style[name] = value;
	};

	const SetStyles = (selector: HTMLElement, styles: Record<string, string>) => {
		if (!Type.IsElement(selector)) return;
		for (const [name, value] of Object.entries(styles)) {
			SetStyle(selector, name, value);
		}
	};

	const Insert = (selector: Element, insertion: Element | string) => {
		if (!Type.IsElement(selector) || !(Type.IsElement(insertion) || Type.IsString(insertion))) return;

		if (Type.IsString(insertion))
			selector.insertAdjacentHTML('beforeend', insertion);
		else
			selector.insertAdjacentElement('beforeend', insertion);
	};

	const InsertAfter = (selector: Element, insertion: Element | string) => {
		if (!Type.IsElement(selector) || !(Type.IsElement(insertion) || Type.IsString(insertion))) return;

		if (Type.IsString(insertion))
			selector.insertAdjacentHTML('afterend', insertion);
		else
			selector.insertAdjacentElement('afterend', insertion);
	};

	const GetTagName = (selector: Element) => {
		if (!Type.IsElement(selector)) return '';
		return selector.tagName.toLowerCase();
	};

	const GetParents = (selector: Element) => {
		if (!Type.IsElement(selector)) return [];
		const parents: Element[] = [];
		let currentParent: ParentNode | null = selector.parentNode;

		while (Type.IsElement(currentParent)) {
			if (HasAttr(currentParent, 'contenteditable')) break;

			parents.push(currentParent);
			currentParent = currentParent.parentNode;
		}

		return parents;
	};

	const On = (selector: Element, eventName: string, event: EventListener) => {
		if (!Type.IsElement(selector) || !Type.IsString(eventName)) return;
		selector.addEventListener(eventName, event);
	};

	const Dispatch = (selector: Element, eventName: string, detail?: object) => {
		const customEvent = new CustomEvent(eventName, {
			detail: detail
		});

		selector.dispatchEvent(customEvent);
	};

	const Show = (selector: HTMLElement, displayType: string = 'block') => {
		if (!Type.IsElement(selector) || !Type.IsString(displayType)) return;
		SetStyle(selector, 'display', displayType);
	};

	const Hide = (selector: HTMLElement) => {
		if (!Type.IsElement(selector)) return;
		SetStyle(selector, 'display', 'none');
	};

	const Create = (tagName: string, option?: Record<string, TCreateOption>) => {
		const newElement = doc.createElement(tagName);
		if (!option) return newElement;

		if (option.attrs && Type.IsObject(option.attrs)) SetAttrs(newElement, option.attrs as Record<string, string>);
		if (option.styles && Type.IsObject(option.styles)) SetStyles(newElement, option.styles as Record<string, string>);

		if (option.class && Type.IsString(option.class)) newElement.className = option.class as string;
		else if (option.class && Type.IsArray(option.class)) newElement.classList.add(...option.class as string[]);

		if (option.html && Type.IsString(option.html)) newElement.innerHTML = option.html;
		if (option.children && Type.IsArray(option.children)) {
			for (const child of option.children) {
				if (!Type.IsElement(child)) continue;
				Insert(newElement, child);
			}
		}

		return newElement;
	};

	const Utils: IDOMUtils = DOMUtils;

	return {
		Doc,
		Select,
		SelectAll,
		SetAttr,
		SetAttrs,
		HasAttr,
		RemoveAttr,
		RemoveAttrs,
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