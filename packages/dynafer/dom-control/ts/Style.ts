import { Arr, Obj, Str, Type } from '@dynafer/utils';
import * as Attribute from './Attribute';
import { TElement } from './Type';

export const GetAsMap = (selector: TElement): Record<string, string> => {
	if (!Obj.HasProperty<HTMLElement>(selector, 'style')) return {};
	const styleList = selector.style.cssText.split(';');
	const styleDict: Record<string, string> = {};
	Arr.Each(styleList, style => {
		const keyValue = style.split(':');
		if (keyValue.length !== 2) return;
		styleDict[Str.DashToCapital(keyValue[0])] = keyValue[1].trim();
	});

	return styleDict;
};

export const Get = (win: Window & typeof globalThis, selector: TElement, name: string, bComputed?: boolean): string => {
	if (!Obj.HasProperty<HTMLElement>(selector, 'style')) return '';
	const computedStyle = win.getComputedStyle(selector);
	const capitalisedStyle = Str.DashToCapital(name);
	if (bComputed) return computedStyle[capitalisedStyle as 'all'];
	const styles = GetAsMap(selector);
	if (!styles[capitalisedStyle]) {
		return computedStyle[capitalisedStyle as 'all'];
	}

	return styles[capitalisedStyle] ?? '';
};

export const GetText = (selector: TElement): string => Obj.GetProperty<CSSStyleDeclaration>(selector, 'style')?.cssText ?? '';

export const Set = (selector: TElement, name: string, value: string) => {
	if (!Obj.HasProperty<HTMLElement>(selector, 'style')) return;

	if (Obj.GetProperty<Record<string, string>>(selector, 'style')?.[name]) {
		selector.style[name as 'all'] = value;
		return;
	}

	const styleList = selector.style.cssText.split(';');
	Arr.Push(styleList, Str.Merge(Str.CapitalToDash(name), ':', value));
	selector.style.cssText = Str.Join(';', ...styleList);
};

export const SetAsMap = (selector: TElement, styles: Record<string, string>) =>
	Obj.Entries(styles, (name, value) => Set(selector, name, value));

export const SetText = (selector: TElement, styleText: string) => {
	if (!Obj.HasProperty<HTMLElement>(selector, 'style')) return;

	if (Str.IsEmpty(styleText)) return Attribute.Remove(selector, 'style');

	selector.style.cssText = styleText;
};

export const Remove = (selector: TElement, name: string) => {
	if (!Obj.HasProperty<HTMLElement>(selector, 'style')) return;

	if (selector.style[name as 'all']) {
		selector.style[name as 'all'] = '';
		if (Str.IsEmpty(selector.style.cssText)) Attribute.Remove(selector, 'style');
		return;
	}

	const styles = GetAsMap(selector);
	const dashedName = Str.CapitalToDash(name);
	if (!styles[dashedName]) return;

	selector.style.cssText = '';
	Obj.Entries(styles, (styleName, styleValue) => {
		if (styleName === dashedName) return;
		selector.style.cssText += `${styleName}: ${styleValue};`;
	});

	if (Str.IsEmpty(selector.style.cssText)) Attribute.Remove(selector, 'style');
};

export const RemoveMultiple = (selector: TElement, ...names: string[]) =>
	Arr.Each(names, name => Remove(selector, name));

export const Has = (selector: TElement, name: string, compareValue?: string): boolean => {
	if (!Obj.HasProperty<HTMLElement>(selector, 'style')) return false;

	const cssText = selector.style.cssText.replace(/\s*:\s*/gi, ':');
	if (compareValue) {
		if (!Type.IsString(compareValue)) return false;
		return Str.Contains(cssText, `${Str.CapitalToDash(name)}:${compareValue.trim()}`);
	}
	return Str.Contains(cssText, Str.CapitalToDash(name));
};
