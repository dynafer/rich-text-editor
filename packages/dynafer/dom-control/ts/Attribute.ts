import { Arr, Obj, Str, Type } from '@dynafer/utils';

export const Get = (selector: Element, attr: string): string | null =>
	selector.getAttribute(attr);

export const Set = (selector: Element, attr: string, value: string) =>
	selector.setAttribute(Str.CapitalToDash(attr), value);

export const SetMultiple = (selector: Element, attrs: Record<string, string>) =>
	Obj.Entries(attrs, (attr, value) => Set(selector, attr, value));

export const Has = (selector: Element, attr: string, value?: string): boolean =>
	Type.IsString(value) ? Get(selector, attr) === value : selector.hasAttribute(attr);

export const Remove = (selector: Element, attr: string) => selector.removeAttribute(Str.CapitalToDash(attr));

export const RemoveMultiple = (selector: Element, attrs: string[]) =>
	Arr.Each(attrs, attr => Remove(selector, attr));