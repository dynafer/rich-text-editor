import { Type } from '@dynafer/utils';

export const BeforeInner = (selector: Element, ...insertions: (Element | string)[]) => {
	for (const insertion of insertions) {
		if (Type.IsString(insertion)) {
			selector.insertAdjacentHTML('afterbegin', insertion);
		} else {
			selector.insertAdjacentElement('afterbegin', insertion);
		}
	}
};

export const AfterInner = (selector: Element, ...insertions: (Element | Node | string)[]) => {
	for (const insertion of insertions) {
		if (Type.IsString(insertion)) {
			selector.insertAdjacentHTML('beforeend', insertion);
		} else if (insertion.nodeType === 1) {
			selector.append(insertion);
		} else {
			selector.appendChild(insertion);
		}
	}
};

export const BeforeOuter = (selector: Element, ...insertions: (Element | string)[]) => {
	for (const insertion of insertions) {
		if (Type.IsString(insertion)) {
			selector.insertAdjacentHTML('beforebegin', insertion);
		} else {
			selector.insertAdjacentElement('beforebegin', insertion);
		}
	}
};

export const AfterOuter = (selector: Element, ...insertions: (Element | string)[]) => {
	for (const insertion of insertions) {
		if (Type.IsString(insertion)) {
			selector.insertAdjacentHTML('afterend', insertion);
		} else {
			selector.insertAdjacentElement('afterend', insertion);
		}
	}
};