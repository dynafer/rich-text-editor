import { Strings, Type } from 'dynafer/utils';

type TCreateOption = Record<string, string> | string[] | string | Element[];

export interface IDom {
	Doc: Document,
	Select: {
		<T extends Node>(selector: T, parent?: Element): T;
		(selector: string, parent?: Element): HTMLElement | null;
	},
	SelectAll: {
		<T extends Node>(selector: T): T[];
		(selector: string): HTMLElement[];
	},
	SetAttr: (element: Element, attr: string, value: string) => void,
	SetAttrs: (element: Element, attrs: Record<string, string>) => void,
	SetStyle: {
		<K extends keyof CSSStyleDeclaration>(selector: HTMLElement, name: K, value: string): void;
		(selector: HTMLElement, name: string, value: string): void;
	},
	SetStyles: (selector: HTMLElement, styles: Record<string, string>) => void,
	Insert: (selector: Element, insertion: Element | string) => void,
	InsertAfter: (selector: Element, insertion: Element | string) => void,
	GetTagName: (selector: Element) => string,
	GetParents: (selector: Element) => Element[],
	On: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: Element, eventName: K, event: GlobalEventHandlersEventMap[K]): void;
		(selector: Element, eventName: string, event: EventListener): void;
	}
	Dispatch: (selector: Element, eventName: string, detail?: object) => void,
	Create: {
		<K extends keyof HTMLElementTagNameMap>(tagName: K, option?: Record<string, TCreateOption>): HTMLElementTagNameMap[K];
		(tagName: string, option?: Record<string, TCreateOption>): HTMLElement;
	},
}

const DOM = (doc: Document = document): IDom => {
	const Doc: Document = doc;

	const Select = (selector: string, parent?: Element): HTMLElement | null =>
		Type.IsElement(parent) ? parent.querySelector(selector) : doc.querySelector(selector);

	const SelectAll = (selector: string): HTMLElement[] =>
		Array.from(doc.querySelectorAll(selector));

	const SetAttr = (element: Element, attr: string, value: string) => {
		element.setAttribute(Strings.CapitalToDash(attr), value);
	};

	const SetAttrs = (element: Element, attrs: Record<string, string>) => {
		for (const [attr, value] of Object.entries(attrs)) {
			SetAttr(element, attr, value);
		}
	};

	const SetStyle = (selector: HTMLElement, name: string, value: string) => {
		selector.style[name] = value;
	};

	const SetStyles = (selector: HTMLElement, styles: Record<string, string>) => {
		for (const [name, value] of Object.entries(styles)) {
			SetStyle(selector, name, value);
		}
	};

	const Insert = (selector: Element, insertion: Element | string) => {
		if (Type.IsString(insertion)) selector.insertAdjacentHTML('beforeend', insertion);
		else selector.insertAdjacentElement('beforeend', insertion);
	};

	const InsertAfter = (selector: Element, insertion: Element | string) => {
		if (Type.IsString(insertion)) selector.insertAdjacentHTML('afterend', insertion);
		else selector.insertAdjacentElement('afterend', insertion);
	};

	const GetTagName = (selector: Element) => {
		return selector.tagName.toLowerCase();
	};

	const GetParents = (selector: Element) => {
		const parents: Element[] = [];
		let currentParent: ParentNode | null = selector.parentNode;

		while (Type.IsElement(currentParent)) {
			if (GetTagName(currentParent) === 'body') break;

			parents.push(currentParent);
			currentParent = currentParent.parentNode;
		}

		return parents;
	};

	const On = (selector: Element, eventName: string, event: EventListener) => {
		selector.addEventListener(eventName, event);
	};

	const Dispatch = (selector: Element, eventName: string, detail?: object) => {
		const customEvent = new CustomEvent(eventName, {
			detail: detail
		});

		selector.dispatchEvent(customEvent);
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

	return {
		Doc,
		Select,
		SelectAll,
		SetAttr,
		SetAttrs,
		SetStyle,
		SetStyles,
		Insert,
		InsertAfter,
		GetTagName,
		GetParents,
		On,
		Dispatch,
		Create,
	};
};

export default DOM();