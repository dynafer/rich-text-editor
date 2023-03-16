import { Attribute, Style } from '@dynafer/dom-control';
import { Arr, Instance, Obj, Str, Type } from '@dynafer/utils';
import Options from '../../Options';
import DOMUtils, { ESCAPE_EMPTY_TEXT_REGEX, ICreateSelectorOption, IDOMUtils } from './DOMUtils';

export type TElement = Node | Element | null;
type TBoundEvent = [(Window & typeof globalThis) | Document | Element, string, EventListener];

export type TCreateOption = Record<string, string> | string[] | string | TElement[] | (string | TElement)[];
export type TEventListener<K extends keyof GlobalEventHandlersEventMap> = (event: GlobalEventHandlersEventMap[K]) => void;

export interface IDom {
	Win: Window & typeof globalThis,
	Doc: Document,
	New: (win: Window & typeof globalThis, doc: Document, bEditor: boolean) => IDom,
	GetRoot: () => HTMLElement,
	CreateFragment: () => DocumentFragment,
	CreateTextNode: (text: string) => Text,
	Select: {
		<T extends Element>(selector: T | string | ICreateSelectorOption, parent?: TElement): T;
		(selector: string | ICreateSelectorOption, parent?: TElement): HTMLElement | null;
	},
	SelectAll: (selector: string | ICreateSelectorOption, parent?: TElement) => HTMLElement[],
	GetAttr: (selector: TElement, attr: string) => string | null,
	SetAttr: (selector: TElement, attr: string, value: string) => void,
	SetAttrs: (selector: TElement, attrs: Record<string, string>) => void,
	HasAttr: (selector: TElement, attr: string, value?: string) => boolean,
	RemoveAttr: (selector: TElement, attr: string) => void,
	RemoveAttrs: (selector: TElement, ...attrs: string[]) => void,
	AddClass: (selector: TElement, ...classes: string[]) => void,
	HasClass: (selector: TElement, className: string) => boolean,
	RemoveClass: (selector: TElement, ...classes: string[]) => void,
	GetStyleText: (selector: HTMLElement | null) => string,
	GetStyles: (selector: HTMLElement | null) => Record<string, string>,
	GetStyle: (selector: HTMLElement | null, name: string, bComputed?: boolean) => string,
	SetStyleText: (selector: HTMLElement | null, styleText: string) => void,
	SetStyle: {
		<K extends keyof CSSStyleDeclaration>(selector: HTMLElement | null, name: K, value: string): void;
		(selector: HTMLElement | null, name: string, value: string): void;
	},
	SetStyles: {
		<K extends keyof CSSStyleDeclaration>(selector: HTMLElement | null, styles: Record<K, string>): void;
		(selector: HTMLElement | null, styles: Record<string, string>): void;
	},
	RemoveStyle: (selector: HTMLElement | null, name: string) => void,
	HasStyle: (selector: HTMLElement | null, name: string, compareValue?: string) => boolean,
	GetRect: {
		(selector: null): null;
		(selector: HTMLElement): DOMRect;
		(selector: HTMLElement | null): DOMRect | null;
	},
	GetText: (selector: HTMLElement) => string,
	GetHTML: (selector: HTMLElement) => string,
	SetText: (selector: HTMLElement, text: string) => void,
	SetHTML: (selector: HTMLElement, html: string) => void,
	GetOuterHTML: (selector: HTMLElement) => string,
	SetOuterHTML: (selector: HTMLElement, html: string) => void,
	InsertBefore: (selector: TElement, ...insertions: (string | TElement)[]) => void,
	Insert: (selector: TElement, ...insertions: (string | TElement)[]) => void,
	InsertAfter: (selector: TElement, ...insertions: (string | TElement)[]) => void,
	Clone: (selector: NonNullable<TElement>, bDeep?: boolean) => Node,
	CloneAndInsert: (selector: NonNullable<TElement>, bDeep: boolean, ...insertions: (string | TElement)[]) => void,
	Closest: (selector: TElement, find: string) => Element | null,
	ClosestByStyle: (selector: TElement, styles: string | (string | Record<string, string>)[] | Record<string, string>) => Element | null,
	IsEditable: (selector: Node) => boolean,
	GetParents: (selector: Node | null, bReverse?: boolean) => Node[],
	GetChildNodes: <T extends boolean = true>(selector: Node | null, bArray?: T | true) => T extends true ? Node[] : NodeListOf<Node>,
	GetChildren: <T extends boolean = true>(selector: Element | null, bArray?: T | true) => T extends true ? Element[] : HTMLCollection,
	On: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TBoundEvent[0], eventName: K, event: TEventListener<K>): void;
		(selector: TBoundEvent[0], eventName: string, event: EventListener): void;
	},
	Off: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TBoundEvent[0], eventName: K, event?: TEventListener<K>): void;
		(selector: TBoundEvent[0], eventName: string, event?: EventListener): void;
	},
	OffAll: (selector: TBoundEvent[0]) => void,
	Dispatch: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TBoundEvent[0], eventName: K): void;
		(selector: TBoundEvent[0], eventName: string): void;
	},
	Show: (selector: HTMLElement, displayType?: string) => void,
	Hide: (selector: HTMLElement) => void,
	IsHidden: (selector: HTMLElement) => boolean,
	Create: {
		<K extends keyof HTMLElementTagNameMap>(tagName: K, option?: Record<string, TCreateOption>): HTMLElementTagNameMap[K];
		(tagName: string, option?: Record<string, TCreateOption>): HTMLElement;
	},
	RemoveChildren: (selector: Element | null, bBubble?: boolean) => void,
	Remove: (selector: Element | null, bBubble?: boolean) => void,
	Utils: IDOMUtils,
}

const DOM = (_win: Window & typeof globalThis = window, _doc: Document = document, bFromEditor: boolean = false): IDom => {
	const Win: Window & typeof globalThis = _win;
	const Doc: Document = _doc;
	const Utils: IDOMUtils = DOMUtils;

	const elementType = Win.Element;
	const nodeType = Win.Node;
	const fragmentType = Win.DocumentFragment;

	const boundEvents: TBoundEvent[] = [];

	const New = (win: Window & typeof globalThis, doc: Document, bEditor: boolean): IDom => DOM(win, doc, bEditor);

	const GetRoot = (): HTMLElement => Doc.documentElement;

	const CreateFragment = (): DocumentFragment => Doc.createDocumentFragment();

	const CreateTextNode = (text: string): Text => Doc.createTextNode(text);

	const Select = (selector: string | ICreateSelectorOption, parent?: TElement): HTMLElement | null =>
		Instance.Is(parent, elementType) || Instance.Is(parent, fragmentType)
			? parent.querySelector(Type.IsString(selector) ? selector : Utils.CreateSelector(selector))
			: Doc.querySelector(Type.IsString(selector) ? selector : Utils.CreateSelector(selector));

	const SelectAll = (selector: string | ICreateSelectorOption, parent?: TElement): HTMLElement[] =>
		Array.from(Instance.Is(parent, elementType) || Instance.Is(parent, fragmentType)
			? parent.querySelectorAll(Type.IsString(selector) ? selector : Utils.CreateSelector(selector))
			: Doc.querySelectorAll(Type.IsString(selector) ? selector : Utils.CreateSelector(selector))
		);

	const GetAttr = (selector: TElement, attr: string): string | null =>
		!Instance.Is(selector, elementType) || !Type.IsString(attr) ? null : Attribute.Get(selector, attr);

	const SetAttr = (selector: TElement, attr: string, value: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(attr) || !Type.IsString(value)) return;
		Attribute.Set(selector, attr, value);
	};

	const SetAttrs = (selector: TElement, attrs: Record<string, string>) => {
		if (!Instance.Is(selector, elementType)) return;
		Obj.Entries(attrs, (attr, value) => SetAttr(selector, attr, value));
	};

	const HasAttr = (selector: TElement, attr: string, value?: string): boolean =>
		!Instance.Is(selector, elementType) ? false : Attribute.Has(selector, attr, value);

	const RemoveAttr = (selector: TElement, attr: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(attr)) return;
		Attribute.Remove(selector, attr);
	};

	const RemoveAttrs = (selector: TElement, ...attrs: string[]) => {
		if (!Instance.Is(selector, elementType)) return;
		Arr.Each(attrs, attr => RemoveAttr(selector, attr));
	};

	const AddClass = (selector: TElement, ...classes: string[]) => {
		if (!Instance.Is(selector, elementType)) return;
		Arr.Each(classes, className => {
			if (!className || Str.IsEmpty(className)) return;
			selector.classList.add(className);
		});
	};

	const HasClass = (selector: TElement, className: string): boolean =>
		!Instance.Is(selector, elementType) ? false : selector.classList.contains(className);

	const RemoveClass = (selector: TElement, ...classes: string[]) => {
		if (!Instance.Is(selector, elementType)) return;
		selector.classList.remove(...classes);
	};

	const GetStyleText = (selector: HTMLElement | null): string =>
		!Instance.Is(selector, elementType) ? '' : Style.GetText(selector);

	const GetStyles = (selector: HTMLElement | null): Record<string, string> =>
		!Instance.Is(selector, elementType) ? {} : Style.GetAsMap(selector);

	const GetStyle = (selector: HTMLElement | null, name: string, bComputed?: boolean): string =>
		!Instance.Is(selector, elementType) ? '' : Style.Get(selector, name, bComputed);

	const SetStyleText = (selector: HTMLElement | null, styleText: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(styleText)) return;
		Style.SetText(selector, styleText);
	};

	const SetStyle = (selector: HTMLElement | null, name: string, value: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(name) || !Type.IsString(value)) return;
		Style.Set(selector, name, value);
		if (bFromEditor) SetAttr(selector, Options.ATTRIBUTE_EDITOR_STYLE, GetStyleText(selector));
	};

	const SetStyles = (selector: HTMLElement | null, styles: Record<string, string>) => {
		if (!Instance.Is(selector, elementType)) return;
		Style.SetAsMap(selector, styles);
		if (bFromEditor) SetAttr(selector, Options.ATTRIBUTE_EDITOR_STYLE, GetStyleText(selector));
	};

	const RemoveStyle = (selector: HTMLElement | null, name: string) => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(name)) return;
		Style.Remove(selector, name);
		if (!bFromEditor) return;

		if (Str.IsEmpty(GetStyleText(selector))) return RemoveAttr(selector, Options.ATTRIBUTE_EDITOR_STYLE);
		SetAttr(selector, Options.ATTRIBUTE_EDITOR_STYLE, GetStyleText(selector));
	};

	const HasStyle = (selector: HTMLElement | null, name: string, compareValue?: string): boolean =>
		!Instance.Is(selector, elementType) || !Type.IsString(name) ? false : Style.Has(selector, name, compareValue);

	const GetRect = ((selector: HTMLElement | null): DOMRect | null =>
		!Instance.Is(selector, elementType) ? null : selector.getClientRects()[0]) as IDom['GetRect'];

	const GetText = (selector: HTMLElement): string =>
		!Instance.Is(selector, elementType) ? '' : decodeURI(encodeURI(selector.innerText).replace(ESCAPE_EMPTY_TEXT_REGEX, ''));

	const GetHTML = (selector: HTMLElement): string =>
		!Instance.Is(selector, elementType) ? '' : decodeURI(encodeURI(selector.innerHTML).replace(ESCAPE_EMPTY_TEXT_REGEX, ''));

	const SetText = (selector: HTMLElement, text: string) => {
		if (!Instance.Is(selector, elementType)) return;
		selector.innerText = text;
	};

	const SetHTML = (selector: HTMLElement, html: string) => {
		if (!Instance.Is(selector, elementType)) return;
		selector.innerHTML = html;
	};

	const GetOuterHTML = (selector: HTMLElement): string =>
		!Instance.Is(selector, elementType) ? '' : decodeURI(encodeURI(selector.outerHTML).replace(ESCAPE_EMPTY_TEXT_REGEX, ''));

	const SetOuterHTML = (selector: HTMLElement, html: string) => {
		if (!Instance.Is(selector, elementType)) return;
		selector.outerHTML = html;
	};

	const InsertBefore = (selector: TElement, ...insertions: (string | TElement)[]) => {
		if (!Instance.Is(selector, elementType) && !Instance.Is(selector, nodeType)) return;

		Arr.Each(insertions, insertion => {
			if (!insertion) return;

			if (Instance.Is(selector, elementType) && Type.IsString(insertion))
				return selector.insertAdjacentHTML('beforebegin', insertion);

			(selector as ChildNode).before(insertion);
		});
	};

	const Insert = (selector: TElement, ...insertions: (string | TElement)[]) => {
		if ((!Instance.Is(selector, elementType) && !Instance.Is(selector, nodeType))) return;

		Arr.Each(insertions, insertion => {
			if (!insertion) return;

			if (Instance.Is(selector, elementType) && Type.IsString(insertion))
				return selector.insertAdjacentHTML('beforeend', insertion);

			selector.appendChild(Type.IsString(insertion) ? CreateTextNode(insertion) : insertion);
		});
	};

	const InsertAfter = (selector: TElement, ...insertions: (string | TElement)[]) => {
		if (!Instance.Is(selector, elementType) && !Instance.Is(selector, nodeType)) return;

		Arr.Each(insertions, insertion => {
			if (!insertion) return;

			if (Instance.Is(selector, elementType) && Type.IsString(insertion))
				return selector.insertAdjacentHTML('afterend', insertion);

			(selector as ChildNode).after(insertion);
		});
	};

	const Clone = (selector: NonNullable<TElement>, bDeep?: boolean): Node => selector.cloneNode(bDeep);

	const CloneAndInsert = (selector: TElement, bDeep: boolean, ...insertions: (string | TElement)[]) => {
		if ((!Instance.Is(selector, elementType) && !Instance.Is(selector, nodeType))) return;

		Arr.Each(insertions, insertion => {
			if (!insertion) return;
			Insert(selector, Type.IsString(insertion) ? insertion : Clone(insertion, bDeep));
		});
	};

	const Closest = (selector: TElement, find: string): Element | null => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(find) || Str.IsEmpty(find)) return null;
		return selector.closest(find);
	};

	const ClosestByStyle = (selector: TElement, styles: string | (string | Record<string, string>)[] | Record<string, string>): Element | null => {
		if (!Instance.Is(selector, elementType)) return null;

		if (!Type.IsString(styles) && !Type.IsArray(styles) && !Type.IsObject(styles)) return null;

		return Closest(selector, Utils.CreateSelector({
			styles,
		}));
	};

	const IsEditable = (selector: Node): boolean => HasAttr(selector, 'contenteditable', 'true');

	const GetParents = (selector: Node | null, bReverse: boolean = false): Node[] => {
		if (!Instance.Is(selector, nodeType) || HasAttr(selector, 'id', Utils.CreateUEID('editor-body', false))) return [];
		const parents: Node[] = [];
		const add = bReverse ? Arr.Push : Arr.Unshift;
		let parent: Node | null = selector;

		if (!Utils.IsText(selector)) add(parents, selector);

		while (parent = parent.parentNode) {
			if (!Instance.Is(parent, nodeType) || HasAttr(parent, 'id', Utils.CreateUEID('editor-body', false))) break;

			add(parents, parent);
		}

		return parents;
	};

	const GetChildNodes = <T extends boolean>(selector: Node | null, bArray: T | true = true): T extends true ? Node[] : NodeListOf<Node> => {
		if (!selector) return ([] as Node[]) as T extends true ? Node[] : NodeListOf<Node>;

		return (bArray === true
			? Array.from(selector.childNodes)
			: selector.childNodes as NodeListOf<Node>
		) as T extends true ? Node[] : NodeListOf<Node>;
	};

	const GetChildren = <T extends boolean>(selector: Element | null, bArray: T | true = true): T extends true ? Element[] : HTMLCollection => {
		if (!selector) return ([] as Element[]) as T extends true ? Element[] : HTMLCollection;

		return (bArray === true
			? Array.from(selector.children)
			: selector.children
		) as T extends true ? Element[] : HTMLCollection;
	};

	const On = (selector: TBoundEvent[0], eventName: string, event: EventListener) => {
		if ((selector !== Win && selector !== Doc && !Instance.Is(selector, elementType)) || !Type.IsString(eventName)) return;
		selector.addEventListener(eventName, event);
		Arr.Push(boundEvents, [selector, eventName, event]);
	};

	const off = (isSame: (bound: TBoundEvent) => boolean) => {
		let deletedCount = 0;
		for (let index = 0, length = boundEvents.length; index < length; ++index) {
			const bound = boundEvents[index - deletedCount];
			if (!isSame(bound)) continue;

			const [target, eventName, event] = bound;
			target.removeEventListener(eventName, event);
			boundEvents.splice(index - deletedCount, 1);
			++deletedCount;
		}
	};

	const Off = (selector: TBoundEvent[0], eventName: string, event?: EventListener) => {
		if ((selector !== Win && selector !== Doc && !Instance.Is(selector, elementType)) || !Type.IsString(eventName)) return;
		const isSame = (bound: TBoundEvent): boolean =>
			selector === bound[0] && eventName === bound[1] && (!event || (event && event === bound[2]));

		off(isSame);
	};

	const OffAll = (selector: TBoundEvent[0]) => {
		if (selector !== Win && selector !== Doc && !Instance.Is(selector, elementType)) return;
		const isSame = (bound: TBoundEvent): boolean =>
			selector === bound[0];

		off(isSame);
	};

	const Dispatch = (selector: TBoundEvent[0], eventName: string) => {
		if ((selector !== Win && selector !== Doc && !Instance.Is(selector, elementType)) || !Type.IsString(eventName)) return;
		const customEvent = new CustomEvent(eventName);

		selector.dispatchEvent(customEvent);
	};

	const Show = (selector: HTMLElement, displayType: string = 'block') => {
		if (!Instance.Is(selector, elementType) || !Type.IsString(displayType)) return;
		SetStyle(selector, 'display', displayType);
	};

	const Hide = (selector: HTMLElement) => {
		if (!Instance.Is(selector, elementType)) return;
		SetStyle(selector, 'display', 'none');
	};

	const IsHidden = (selector: HTMLElement): boolean =>
		!Instance.Is(selector, elementType) ? false : GetStyle(selector, 'display') === 'none';

	const Create = (tagName: string, option?: Record<string, TCreateOption>): HTMLElement => {
		const newElement = Doc.createElement(tagName);
		if (!option) return newElement;

		if (option.attrs && Type.IsObject(option.attrs)) SetAttrs(newElement, option.attrs as Record<string, string>);
		if (option.styles && Type.IsObject(option.styles)) SetStyles(newElement, option.styles as Record<string, string>);

		if (option.class && Type.IsString(option.class)) newElement.className = option.class;
		else if (option.class && Type.IsArray(option.class)) AddClass(newElement, ...option.class as string[]);

		if (option.html && Type.IsString(option.html)) SetHTML(newElement, option.html);
		if (option.children && Type.IsArray(option.children)) {
			Arr.Each(option.children, child => {
				if (!Instance.Is(child, elementType) && !Instance.Is(child, nodeType) && !Type.IsString(child)) return;
				Insert(newElement, child);
			});
		}

		return newElement;
	};

	const RemoveChildren = (selector: Element | null, bBubble: boolean = false) => {
		if (!Instance.Is(selector, elementType)) return;
		const children = GetChildren(selector);
		if (Arr.IsEmpty(children)) return;
		Arr.Each(children, child => OffAll(child));

		if (!bBubble) return;

		Arr.Each(children, child => {
			RemoveChildren(child, bBubble);
			child.remove();
		});
	};

	const Remove = (selector: Element | null, bBubble: boolean = false) => {
		if (!Instance.Is(selector, elementType)) return;
		OffAll(selector);

		if (bBubble) RemoveChildren(selector, bBubble);

		selector.remove();
	};

	return {
		Win,
		Doc,
		New,
		GetRoot,
		Select,
		SelectAll,
		GetAttr,
		SetAttr,
		SetAttrs,
		HasAttr,
		RemoveAttr,
		RemoveAttrs,
		AddClass,
		HasClass,
		RemoveClass,
		GetStyleText,
		GetStyles,
		GetStyle,
		SetStyleText,
		SetStyle,
		SetStyles,
		RemoveStyle,
		HasStyle,
		GetRect,
		GetText,
		GetHTML,
		SetText,
		SetHTML,
		GetOuterHTML,
		SetOuterHTML,
		InsertBefore,
		Insert,
		InsertAfter,
		Clone,
		CloneAndInsert,
		Closest,
		ClosestByStyle,
		IsEditable,
		GetParents,
		GetChildNodes,
		GetChildren,
		On,
		Off,
		OffAll,
		Dispatch,
		Show,
		Hide,
		IsHidden,
		CreateFragment,
		CreateTextNode,
		Create,
		RemoveChildren,
		Remove,
		Utils,
	};
};

export default DOM();