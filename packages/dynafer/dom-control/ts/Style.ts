import { Arr, Str, Type } from '@dynafer/utils';
import * as Attribute from './Attribute';

const win = window;

export const GetAsMap = (selector: HTMLElement): Record<string, string> => {
	const styleList = selector.style.cssText.split(';');
	const styleDict: Record<string, string> = {};
	for (const style of styleList) {
		const keyValue = style.split(':');
		if (keyValue.length !== 2) continue;
		styleDict[Str.DashToCapital(keyValue[0])] = keyValue[1].trim();
	}

	return styleDict;
};

export const Get = (selector: HTMLElement, name: string, bComputed?: boolean): string => {
	const computedStyle = win.getComputedStyle(selector);
	const capitalisedStyle = Str.DashToCapital(name);
	if (bComputed) return computedStyle[capitalisedStyle as 'all'];
	const styles = GetAsMap(selector);
	if (!styles[capitalisedStyle]) {
		return computedStyle[capitalisedStyle as 'all'];
	}

	return styles[capitalisedStyle] ?? '';
};

export const GetText = (selector: HTMLElement): string => selector.style.cssText;

export const Set = (selector: HTMLElement, name: string, value: string) => {
	if (selector.style[name as 'all']) {
		selector.style[name as 'all'] = value;
		return;
	}

	const styleList = selector.style.cssText.split(';');
	Arr.Push(styleList, Str.Merge(Str.CapitalToDash(name), ':', value));
	selector.style.cssText = Str.Join(';', ...styleList);
};

export const SetAsMap = (selector: HTMLElement, styles: Record<string, string>) => {
	for (const [name, value] of Object.entries(styles)) {
		Set(selector, name, value);
	}
};

export const SetText = (selector: HTMLElement, styleText: string) => {
	if (Str.IsEmpty(styleText)) {
		Attribute.Remove(selector, 'style');
		return;
	}

	selector.style.cssText = styleText;
};

export const Remove = (selector: HTMLElement, name: string) => {
	if (selector.style[name as 'all']) {
		selector.style[name as 'all'] = '';
		if (Str.IsEmpty(selector.style.cssText)) Attribute.Remove(selector, 'style');
		return;
	}

	const styles = GetAsMap(selector);
	const dashedName = Str.CapitalToDash(name);
	if (!styles[dashedName]) return;

	selector.style.cssText = '';
	for (const [styleName, styleValue] of Object.entries(styles)) {
		if (styleName === dashedName) continue;
		selector.style.cssText += `${styleName}: ${styleValue};`;
	}

	if (Str.IsEmpty(selector.style.cssText)) Attribute.Remove(selector, 'style');
};

export const Has = (selector: HTMLElement, name: string, compareValue?: string): boolean => {
	const cssText = selector.style.cssText.replace(/\s*:\s*/gi, ':');
	if (compareValue) {
		if (!Type.IsString(compareValue)) return false;
		return Str.Contains(cssText, `${Str.CapitalToDash(name)}:${compareValue.trim()}`);
	}
	return Str.Contains(cssText, Str.CapitalToDash(name));
};
