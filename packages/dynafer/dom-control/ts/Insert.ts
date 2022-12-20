import { Arr, Type } from '@dynafer/utils';

export const BeforeInner = (selector: Element, ...insertions: (Element | Node | string)[]) => {
	for (const insertion of Arr.Reverse(insertions)) {
		if (Type.IsString(insertion)) {
			selector.insertAdjacentHTML('afterbegin', insertion);
			continue;
		}

		if (selector.firstChild) {
			selector.firstChild.before(insertion);
			continue;
		}

		selector.append(insertion);
	}
};

export const AfterInner = (selector: Element, ...insertions: (Element | Node | string)[]) => {
	for (const insertion of insertions) {
		if (Type.IsString(insertion)) {
			selector.insertAdjacentHTML('beforeend', insertion);
			continue;
		}

		selector.append(insertion);
	}
};

export const BeforeOuter = (selector: Element, ...insertions: (Element | Node | string)[]) => {
	for (const insertion of insertions) {
		if (Type.IsString(insertion)) {
			selector.insertAdjacentHTML('beforebegin', insertion);
			continue;
		}

		selector.before(insertion);
	}
};

export const AfterOuter = (selector: Element, ...insertions: (Element | Node | string)[]) => {
	for (const insertion of insertions) {
		if (Type.IsString(insertion)) {
			selector.insertAdjacentHTML('afterend', insertion);
			continue;
		}

		selector.after(insertion);
	}
};