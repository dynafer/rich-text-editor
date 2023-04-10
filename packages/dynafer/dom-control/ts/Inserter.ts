import { Arr, Type } from '@dynafer/utils';
import * as NodeType from './NodeType';
import { TElement } from './Type';

const insertHTML = (selector: Element, position: InsertPosition, insertion: string) =>
	selector.insertAdjacentHTML(position, insertion);

export const BeforeInner = (selector: TElement, ...insertions: (TElement | string)[]) => {
	if (!NodeType.IsElement(selector) && !NodeType.IsNode(selector)) return;

	Arr.Each(Arr.Reverse(insertions), insertion => {
		if (!insertion) return;
		if (NodeType.IsElement(selector) && Type.IsString(insertion)) return insertHTML(selector, 'afterbegin', insertion);
		if (selector.firstChild) return selector.firstChild.before(insertion);

		selector.appendChild(Type.IsString(insertion) ? document.createTextNode(insertion) : insertion);
	});
};

export const AfterInner = (selector: TElement, ...insertions: (TElement | string)[]) => {
	if (!NodeType.IsElement(selector) && !NodeType.IsNode(selector)) return;

	Arr.Each(insertions, insertion => {
		if (!insertion) return;
		if (NodeType.IsElement(selector) && Type.IsString(insertion)) return insertHTML(selector, 'beforeend', insertion);

		selector.appendChild(Type.IsString(insertion) ? document.createTextNode(insertion) : insertion);
	});
};

export const BeforeOuter = (selector: TElement, ...insertions: (TElement | string)[]) => {
	if (!NodeType.IsElement(selector) && !NodeType.IsNode(selector)) return;

	Arr.Each(insertions, insertion => {
		if (!insertion) return;
		if (NodeType.IsElement(selector) && Type.IsString(insertion)) return insertHTML(selector, 'beforebegin', insertion);
		(selector as ChildNode).before(insertion);
	});
};

export const AfterOuter = (selector: TElement, ...insertions: (TElement | string)[]) => {
	if (!NodeType.IsElement(selector) && !NodeType.IsNode(selector)) return;

	Arr.Each(insertions, insertion => {
		if (!insertion) return;
		if (NodeType.IsElement(selector) && Type.IsString(insertion)) return insertHTML(selector, 'afterend', insertion);
		(selector as ChildNode).after(insertion);
	});
};