import { Utils, Strings, Type } from 'dynafer/utils';

type TCreateOption = Record<string, string> | string;

export interface IDom {
	Doc: Document,
	Select: {
		<T extends Node>(selector: T): T;
		(selector: string): HTMLElement | null;
	},
	SelectAll: {
		<T extends Node>(selector: T): T[];
		(selector: string): HTMLElement[];
	},
	SetAttr: (element: Element, attr: string, value: string) => void,
	SetAttrs: (element: Element, attrs: Record<string, string>) => void,
	SetStyle: (selector: HTMLElement, name: string, value: string) => void,
	SetStyles: (selector: HTMLElement, styles: Record<string, string>) => void,
	Create: {
		<K extends keyof HTMLElementTagNameMap>(tagName: K, option?: Record<string, TCreateOption>): HTMLElementTagNameMap[K];
		(tagName: string, option?: Record<string, TCreateOption>): HTMLElement;
	},
	Insert: (selector: HTMLElement, insertion: HTMLElement | string) => void,
	InsertAfter: (selector: HTMLElement, insertion: HTMLElement | string) => void,
	SetUEID: (selector: HTMLElement, id: string) => string,
}

const DOM = (doc: Document = document): IDom => {
	const Doc: Document = doc;

	const Select = (selector: string): HTMLElement | null => {
		return doc.querySelector(selector);
	};

	const SelectAll = (selector: string): HTMLElement[] => {
		return Array.from(doc.querySelectorAll(selector));
	};

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

	const Create = (tagName: string, option?: Record<string, TCreateOption>): HTMLElement => {
		const newElement = doc.createElement(tagName);
		if (!option) return newElement;

		if (option.attrs && Type.IsObject(option.attrs)) SetAttrs(newElement, option.attrs as Record<string, string>);
		if (option.styles && Type.IsObject(option.styles)) SetStyles(newElement, option.styles as Record<string, string>);

		if (option.class && Type.IsString(option.class)) newElement.className = option.class as string;
		else if (option.class && Type.IsArray(option.class)) newElement.classList.add(...option.class as string[]);

		if (option.html && Type.IsString(option.html)) newElement.innerHTML = option.html;

		return newElement;
	};

	const Insert = (selector: HTMLElement, insertion: HTMLElement | string) => {
		if (Type.IsString(insertion)) selector.insertAdjacentHTML('beforeend', insertion);
		else selector.insertAdjacentElement('beforeend', insertion);
	};

	const InsertAfter = (selector: HTMLElement, insertion: HTMLElement | string) => {
		if (Type.IsString(insertion)) selector.insertAdjacentHTML('afterend', insertion);
		else selector.insertAdjacentElement('afterend', insertion);
	};

	const SetUEID = (selector: HTMLElement, id: string): string => {
		const UEID: string = Utils.CreateUEID(id);

		SetAttr(selector, 'id', UEID);

		return UEID;
	};

	return {
		Doc,
		Select,
		SelectAll,
		SetAttr,
		SetAttrs,
		SetStyle,
		SetStyles,
		Create,
		Insert,
		InsertAfter,
		SetUEID,
	};
};

export default DOM();