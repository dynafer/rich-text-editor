import { Arr, Obj, Str, Type } from '@dynafer/utils';
import * as NodeType from './NodeType';
import { TElement } from './Type';

export type TAttributeSetter = string[] | Record<string, string> | (string | Record<string, string>)[];

export const Get = (selector: TElement, attr: string): string | null =>
	NodeType.IsElement(selector) ? selector.getAttribute(attr) : null;

export const Set = (selector: TElement, attr: string, value?: string) => {
	if (!NodeType.IsElement(selector)) return;
	selector.setAttribute(Str.CapitalToDash(attr), value ?? '');
};

export const SetMultiple = (selector: TElement, attrs: TAttributeSetter) => {
	if (Type.IsArray(attrs))
		return Arr.Each(attrs, attr => {
			if (Type.IsString(attr)) return Set(selector, attr);
			Obj.Entries(attr, (name, value) => Set(selector, name, value));
		});

	if (!Type.IsObject(attrs)) return;
	Obj.Entries(attrs, (attr, value) => Set(selector, attr, value));
};


export const Has = (selector: TElement, attr: string, value?: string): boolean =>
	Type.IsString(value)
		? Get(selector, attr) === value
		: (NodeType.IsElement(selector) ? selector?.hasAttribute(attr) : false);

export const Remove = (selector: TElement, attr: string) => {
	if (!NodeType.IsElement(selector)) return;
	selector.removeAttribute(Str.CapitalToDash(attr));
};

export const RemoveMultiple = (selector: TElement, attrs: string[]) =>
	Arr.Each(attrs, attr => Remove(selector, attr));