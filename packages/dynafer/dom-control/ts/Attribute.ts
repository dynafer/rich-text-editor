import { Arr, Obj, Str, Type } from '@dynafer/utils';
import * as NodeType from './NodeType';

export const Get = (selector: Node | Element | null, attr: string): string | null =>
	NodeType.IsElement(selector) ? selector.getAttribute(attr) : null;

export const Set = (selector: Node | Element | null, attr: string, value: string) => {
	if (!NodeType.IsElement(selector)) return;
	selector.setAttribute(Str.CapitalToDash(attr), value);
};

export const SetMultiple = (selector: Node | Element | null, attrs: Record<string, string>) =>
	Obj.Entries(attrs, (attr, value) => Set(selector, attr, value));

export const Has = (selector: Node | Element | null, attr: string, value?: string): boolean =>
	Type.IsString(value)
		? Get(selector, attr) === value
		: (NodeType.IsElement(selector) ? selector?.hasAttribute(attr) : false);

export const Remove = (selector: Node | Element | null, attr: string) => {
	if (!NodeType.IsElement(selector)) return;
	selector.removeAttribute(Str.CapitalToDash(attr));
};

export const RemoveMultiple = (selector: Node | Element | null, attrs: string[]) =>
	Arr.Each(attrs, attr => Remove(selector, attr));