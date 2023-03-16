import { Arr, Type } from '@dynafer/utils';

export const BeforeInner = (selector: Element, ...insertions: (Element | Node | string)[]) =>
	Arr.Each(Arr.Reverse(insertions), insertion => {
		if (Type.IsString(insertion)) return selector.insertAdjacentHTML('afterbegin', insertion);
		if (selector.firstChild) return selector.firstChild.before(insertion);

		selector.append(insertion);
	});

export const AfterInner = (selector: Element, ...insertions: (Element | Node | string)[]) =>
	Arr.Each(insertions, insertion => {
		if (Type.IsString(insertion)) return selector.insertAdjacentHTML('beforeend', insertion);
		selector.append(insertion);
	});

export const BeforeOuter = (selector: Element, ...insertions: (Element | Node | string)[]) =>
	Arr.Each(insertions, insertion => {
		if (Type.IsString(insertion)) return selector.insertAdjacentHTML('beforebegin', insertion);
		selector.before(insertion);
	});

export const AfterOuter = (selector: Element, ...insertions: (Element | Node | string)[]) =>
	Arr.Each(insertions, insertion => {
		if (Type.IsString(insertion)) return selector.insertAdjacentHTML('afterend', insertion);
		selector.after(insertion);
	});