import { IsString, IsObject, IsArray } from 'finer/packages/utils/Type';
import { CapitalToDash } from 'finer/packages/utils/String';

type TCreateOption = IMap<string> | string;

export interface IDom {
	$: Document,
	Select: {
		<T extends Node>(selector: T): T;
		(selector: string): HTMLElement | null;
	},
	SelectAll: {
		<T extends Node>(selector: T): T[];
		(selector: string): HTMLElement[];
	},
	SetAttr: (element: Element, attr: string, value: string) => void,
	SetAttrs: (element: Element, attrs: IMap<string>) => void,
	SetStyle: (selector: HTMLElement, name: string, value: string) => void,
	SetStyles: (selector: HTMLElement, styles: IMap<string>) => void,
	Create: {
		<K extends keyof HTMLElementTagNameMap>(tagName: K, option?: IMap<TCreateOption>): HTMLElementTagNameMap[K];
		(tagName: string, option?: IMap<TCreateOption>): HTMLElement;
	},
	Insert: (selector: HTMLElement, insertion: HTMLElement | string) => void,
}

const DOM = (doc: Document = document): IDom => {
	const $: Document = document;

	const Select = (selector: string): HTMLElement | null => {
		return doc.querySelector(selector);
	};

	const SelectAll = (selector: string): HTMLElement[] => {
		return Array.from(doc.querySelectorAll(selector));
	};

	const SetAttr = (element: Element, attr: string, value: string) => {
		element.setAttribute(CapitalToDash(attr), value);
	};

	const SetAttrs = (element: Element, attrs: IMap<string>) => {
		for (const [attr, value] of Object.entries(attrs)) {
			SetAttr(element, attr, value);
		}
	};

	const SetStyle = (selector: HTMLElement, name: string, value: string) => {
		selector.style[name] = value;
	};

	const SetStyles = (selector: HTMLElement, styles: IMap<string>) => {
		for (const [name, value] of Object.entries(styles)) {
			SetStyle(selector, name, value);
		}
	};

	const Create = (tagName: string, option?: IMap<TCreateOption>): HTMLElement => {
		const newElement = doc.createElement(tagName);
		if (!option) return newElement;

		if (option.attrs && IsObject(option.attrs)) SetAttrs(newElement, option.attrs as IMap<string>);
		if (option.styles && IsObject(option.styles)) SetStyles(newElement, option.styles as IMap<string>);

		if (option.class && IsString(option.class)) newElement.className = option.class;
		else if (option.class && IsArray(option.class)) newElement.classList.add(...option.class as string[]);

		return newElement;
	};

	const Insert = (selector: HTMLElement, insertion: HTMLElement | string) => {
		if (IsString(insertion)) selector.insertAdjacentHTML('beforeend', insertion);
		else selector.insertAdjacentElement('beforeend', insertion);
	};

	return {
		$,
		Select,
		SelectAll,
		SetAttr,
		SetAttrs,
		SetStyle,
		SetStyles,
		Create,
		Insert,
	};
};

export default DOM;