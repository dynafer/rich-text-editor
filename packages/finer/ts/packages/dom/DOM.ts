import { Attribute, Inserter, NodeType, Style } from '@dynafer/dom-control';
import { Arr, Obj, Str, Type } from '@dynafer/utils';
import Options from '../../Options';
import DOMElement, { IDOMElement } from './DOMElement';
import DOMEventUtils, { IDOMEventUtils, TEventTarget } from './DOMEventUtils';
import DOMUtils, { ICreateSelectorOption, IDOMUtils, REGEX_EMPTY_TEXT } from './DOMUtils';

export type TDOMCreateOption = IDOMCreateOption | IDOMCreateOptionFromEditor | IDOMCreateOptionFromEditorIFrame;

export type TElement = Node | Element | null;
export type TCreateOption = Attribute.TAttributeSetter | string | TElement[] | (string | TElement)[];
export type TEventListener<K extends keyof GlobalEventHandlersEventMap> = (event: GlobalEventHandlersEventMap[K]) => void;

interface IDOMCreateOption {
	window?: Window & typeof globalThis | null,
	document?: Document | null,
	bEditor: false,
}

interface IDOMCreateOptionFromEditor {
	window?: Window & typeof globalThis | null,
	document?: Document | null,
	bEditor: true,
	bSelfBody: false,
	body: HTMLElement;
}

interface IDOMCreateOptionFromEditorIFrame {
	window?: Window & typeof globalThis | null,
	document?: Document | null,
	bEditor: true,
	bSelfBody: true,
}

export interface IDom {
	readonly Win: Window & typeof globalThis,
	readonly Doc: Document,
	readonly Utils: IDOMUtils,
	readonly EventUtils: IDOMEventUtils,
	readonly Element: IDOMElement,
	New: (options: TDOMCreateOption) => IDom,
	GetRoot: () => HTMLElement,
	CreateFragment: () => DocumentFragment,
	CreateTextNode: (text: string) => Text,
	Select: {
		<T extends Element>(selector: T | string | ICreateSelectorOption, parent?: TElement): T;
		(selector: string | ICreateSelectorOption, parent?: TElement): HTMLElement | null;
	},
	SelectAll: {
		<T extends Element>(selector: T | string | ICreateSelectorOption, parent?: TElement): T[],
		(selector: string | ICreateSelectorOption, parent?: TElement): HTMLElement[],
	},
	GetAttr: (selector: TElement, attr: string) => string | null,
	SetAttr: (selector: TElement, attr: string, value?: string) => void,
	SetAttrs: (selector: TElement, attrs: Attribute.TAttributeSetter) => void,
	HasAttr: (selector: TElement, attr: string, value?: string) => boolean,
	RemoveAttr: (selector: TElement, attr: string) => void,
	RemoveAttrs: (selector: TElement, ...attrs: string[]) => void,
	AddClass: (selector: TElement, ...classes: string[]) => void,
	HasClass: (selector: TElement, className: string) => boolean,
	RemoveClass: (selector: TElement, ...classes: string[]) => void,
	GetStyleText: (selector: TElement) => string,
	GetStyles: (selector: TElement) => Record<string, string>,
	GetStyle: (selector: TElement, name: string, bComputed?: boolean) => string,
	SetStyleText: (selector: TElement, styleText: string) => void,
	SetStyle: {
		<K extends keyof CSSStyleDeclaration>(selector: TElement, name: K, value: string): void;
		(selector: TElement, name: string, value: string): void;
	},
	SetStyles: {
		<K extends keyof CSSStyleDeclaration>(selector: TElement, styles: Record<K, string>): void;
		(selector: TElement, styles: Record<string, string>): void;
	},
	RemoveStyle: (selector: TElement, name: string) => void,
	HasStyle: (selector: TElement, name: string, compareValue?: string) => boolean,
	GetRect: (selector: HTMLElement | null) => DOMRect | null,
	GetText: (selector: TElement) => string,
	GetHTML: (selector: TElement) => string,
	GetOuterHTML: (selector: TElement) => string,
	SetText: (selector: TElement, text: string) => void,
	SetHTML: (selector: TElement, html: string) => void,
	SetOuterHTML: (selector: TElement, html: string) => void,
	InsertBefore: (selector: TElement, ...insertions: (string | TElement)[]) => void,
	InsertFirst: (selector: TElement, ...insertions: (string | TElement)[]) => void,
	Insert: (selector: TElement, ...insertions: (string | TElement)[]) => void,
	InsertAfter: (selector: TElement, ...insertions: (string | TElement)[]) => void,
	Clone: {
		<T extends Element>(selector: T | NonNullable<TElement>, bDeep?: boolean): T;
		(selector: NonNullable<TElement>, bDeep?: boolean): Node;
	},
	CloneAndInsert: (selector: NonNullable<TElement>, bDeep: boolean, ...insertions: (string | TElement)[]) => void,
	Closest: {
		<T extends Element>(selector: T | TElement, find: string): T | null;
		(selector: TElement, find: string): Element | null;
	},
	ClosestByStyle: (selector: TElement, styles: string | (string | Record<string, string>)[] | Record<string, string>) => Element | null,
	IsEditable: (selector: Node) => boolean,
	GetParents: (selector: TElement, bReverse?: boolean) => Element[],
	GetChildNodes: <T extends boolean = true>(selector: TElement, bArray?: T | true) => T extends true ? Node[] : NodeListOf<Node>,
	GetChildren: <T extends boolean = true>(selector: TElement, bArray?: T | true) => T extends true ? Element[] : HTMLCollection,
	On: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TEventTarget, eventName: K, event: TEventListener<K>): void;
		(selector: TEventTarget, eventName: string, event: EventListener): void;
	},
	Off: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TEventTarget, eventName: K, event: TEventListener<K>): void;
		(selector: TEventTarget, eventName: string, event: EventListener): void;
	},
	Dispatch: {
		<K extends keyof GlobalEventHandlersEventMap>(selector: TEventTarget, eventName: K): void;
		(selector: TEventTarget, eventName: string): void;
	},
	Show: (selector: TElement, displayType?: string) => void,
	Hide: (selector: TElement) => void,
	IsHidden: (selector: TElement) => boolean,
	Create: {
		<K extends keyof HTMLElementTagNameMap>(tagName: K, option?: Record<string, TCreateOption>): HTMLElementTagNameMap[K];
		(tagName: string, option?: Record<string, TCreateOption>): HTMLElement;
	},
	RemoveChildren: (selector: TElement, bBubble?: boolean) => void,
	Remove: (selector: TElement, bBubble?: boolean) => void,
}

const DOM = (opts: TDOMCreateOption): IDom => {
	const Win: Window & typeof globalThis = opts.window ?? window;
	const Doc: Document = opts.document ?? document;
	const Utils: IDOMUtils = DOMUtils;

	const EventUtils: IDOMEventUtils = DOMEventUtils;

	const New = (options: TDOMCreateOption): IDom => DOM(options);

	const GetRoot = (): HTMLElement => Doc.documentElement;

	const CreateFragment = (): DocumentFragment => Doc.createDocumentFragment();
	const CreateTextNode = (text: string): Text => Doc.createTextNode(text);

	const getFromSelector = (parent?: TElement): Element | Document | DocumentFragment => {
		if (NodeType.IsElement(parent) || NodeType.IsDocumentFragment(parent)) return parent;
		if (opts.bEditor) return !opts.bSelfBody ? opts.body : Doc.body;
		return Doc;
	};

	const Select = (selector: string | ICreateSelectorOption, parent?: TElement): HTMLElement | null =>
		getFromSelector(parent).querySelector(Type.IsString(selector) ? selector : Utils.CreateSelector(selector));

	const SelectAll = (selector: string | ICreateSelectorOption, parent?: TElement): HTMLElement[] =>
		Arr.Convert(getFromSelector(parent).querySelectorAll(Type.IsString(selector) ? selector : Utils.CreateSelector(selector)));

	const GetAttr = (selector: TElement, attr: string): string | null => Attribute.Get(selector, attr);
	const SetAttr = (selector: TElement, attr: string, value?: string) => Attribute.Set(selector, attr, value);
	const SetAttrs = (selector: TElement, attrs: Attribute.TAttributeSetter) => Attribute.SetMultiple(selector, attrs);
	const HasAttr = (selector: TElement, attr: string, value?: string): boolean => Attribute.Has(selector, attr, value);
	const RemoveAttr = (selector: TElement, attr: string) => Attribute.Remove(selector, attr);
	const RemoveAttrs = (selector: TElement, ...attrs: string[]) => Arr.Each(attrs, attr => RemoveAttr(selector, attr));

	const AddClass = (selector: TElement, ...classes: string[]) => {
		if (!NodeType.IsElement(selector)) return;
		Arr.Each(classes, className => {
			if (!className || Str.IsEmpty(className)) return;
			selector.classList.add(className);
		});
	};

	const HasClass = (selector: TElement, className: string): boolean =>
		!NodeType.IsElement(selector) ? false : selector.classList.contains(className);

	const RemoveClass = (selector: TElement, ...classes: string[]) => {
		if (!NodeType.IsElement(selector)) return;
		selector.classList.remove(...classes);
	};

	const GetStyleText = (selector: TElement): string => Style.GetText(selector);
	const GetStyles = (selector: TElement): Record<string, string> => Style.GetAsMap(selector);
	const GetStyle = (selector: TElement, name: string, bComputed?: boolean): string => Style.Get(Win, selector, name, bComputed);
	const SetStyleText = (selector: TElement, styleText: string) => Style.SetText(selector, styleText);
	const SetStyle = (selector: TElement, name: string, value: string) => {
		Style.Set(selector, name, value);
		if (opts.bEditor) SetAttr(selector, Options.ATTRIBUTE_EDITOR_STYLE, GetStyleText(selector));
	};
	const SetStyles = (selector: TElement, styles: Record<string, string>) => {
		Style.SetAsMap(selector, styles);
		if (opts.bEditor) SetAttr(selector, Options.ATTRIBUTE_EDITOR_STYLE, GetStyleText(selector));
	};
	const RemoveStyle = (selector: TElement, name: string) => {
		Style.Remove(selector, name);
		if (!opts.bEditor) return;
		if (Str.IsEmpty(GetStyleText(selector))) return RemoveAttr(selector, Options.ATTRIBUTE_EDITOR_STYLE);
		SetAttr(selector, Options.ATTRIBUTE_EDITOR_STYLE, GetStyleText(selector));
	};
	const HasStyle = (selector: TElement, name: string, compareValue?: string): boolean =>
		!NodeType.IsElement(selector) || !Type.IsString(name) ? false : Style.Has(selector, name, compareValue);

	const GetRect = ((selector: TElement): DOMRect | null => !NodeType.IsElement(selector) ? null : selector.getClientRects()[0]);

	const removeEmptyText = (text: string): string => decodeURI(encodeURI(text).replace(REGEX_EMPTY_TEXT, ''));

	const GetText = (selector: TElement): string => removeEmptyText(Obj.GetProperty(selector, 'innerText') ?? '');
	const GetHTML = (selector: TElement): string => removeEmptyText(Obj.GetProperty(selector, 'innerHTML') ?? '');
	const GetOuterHTML = (selector: TElement): string => removeEmptyText(Obj.GetProperty(selector, 'outerHTML') ?? '');
	const SetText = (selector: TElement, text: string) => Obj.SetProperty(selector, 'innerText', text);
	const SetHTML = (selector: TElement, text: string) => Obj.SetProperty(selector, 'innerHTML', text);
	const SetOuterHTML = (selector: TElement, text: string) => Obj.SetProperty(selector, 'outerHTML', text);

	const InsertBefore = (selector: TElement, ...insertions: (string | TElement)[]) => Inserter.BeforeOuter(selector, ...insertions);
	const InsertFirst = (selector: TElement, ...insertions: (string | TElement)[]) => Inserter.BeforeInner(Doc, selector, ...insertions);
	const Insert = (selector: TElement, ...insertions: (string | TElement)[]) => Inserter.AfterInner(Doc, selector, ...insertions);
	const InsertAfter = (selector: TElement, ...insertions: (string | TElement)[]) => Inserter.AfterOuter(selector, ...insertions);

	const Clone = <T extends Element>(selector: T | NonNullable<TElement>, bDeep?: boolean): T | Node => selector.cloneNode(bDeep);

	const CloneAndInsert = (selector: TElement, bDeep: boolean, ...insertions: (string | TElement)[]) => {
		if ((!NodeType.IsElement(selector) && !NodeType.IsNode(selector))) return;

		Arr.Each(insertions, insertion => {
			if (!insertion) return;
			Insert(selector, Type.IsString(insertion) ? insertion : Clone(insertion, bDeep));
		});
	};

	const Closest = (selector: TElement, find: string): Element | null => {
		if (!NodeType.IsElement(selector) || !Type.IsString(find) || Str.IsEmpty(find)) return null;
		const closest = selector.closest(find);
		if (!closest || HasAttr(closest, 'id', Utils.CreateUEID('editor-body', false))) return null;
		return closest;
	};

	const ClosestByStyle = (selector: TElement, styles: string | (string | Record<string, string>)[] | Record<string, string>): Element | null =>
		!Type.IsString(styles) && !Type.IsArray(styles) && !Type.IsObject(styles)
			? null
			: Closest(selector, Utils.CreateSelector({ styles }));

	const IsEditable = (selector: Node): boolean => HasAttr(selector, 'contenteditable', 'true');

	const GetParents = (selector: TElement, bReverse: boolean = false): Element[] => {
		if (!NodeType.IsNode(selector) || HasAttr(selector, 'id', Utils.CreateUEID('editor-body', false))) return [];
		const parents: Element[] = [];
		const add = bReverse ? Arr.Push : Arr.Unshift;
		let parent: Node | null = selector;

		if (!NodeType.IsText(selector)) add(parents, selector);

		while (parent = parent.parentNode) {
			if (!NodeType.IsNode(parent) || HasAttr(parent, 'id', Utils.CreateUEID('editor-body', false))) break;

			add(parents, parent);
		}

		return parents;
	};

	const GetChildNodes = <T extends boolean>(selector: TElement, bArray: T | true = true): T extends true ? Node[] : NodeListOf<Node> => {
		if (!selector) return ([] as Node[]) as T extends true ? Node[] : NodeListOf<Node>;

		return (bArray === true
			? Arr.Convert(selector.childNodes)
			: selector.childNodes as NodeListOf<Node>
		) as T extends true ? Node[] : NodeListOf<Node>;
	};

	const GetChildren = <T extends boolean>(selector: TElement, bArray: T | true = true): T extends true ? Element[] : HTMLCollection => {
		if (!NodeType.IsElement(selector)) return ([] as Element[]) as T extends true ? Element[] : HTMLCollection;

		return (bArray === true
			? Arr.Convert(selector.children)
			: selector.children
		) as T extends true ? Element[] : HTMLCollection;
	};

	const On = (selector: TEventTarget, eventName: string, event: EventListener) => EventUtils.Bind(selector, eventName, event);
	const Off = (selector: TEventTarget, eventName: string, event: EventListener) => EventUtils.Unbind(selector, eventName, event);

	const Dispatch = (selector: TEventTarget, eventName: string) => {
		if ((selector !== Win && selector !== Doc && !NodeType.IsElement(selector)) || !Type.IsString(eventName)) return;
		const customEvent = new CustomEvent(eventName);

		selector.dispatchEvent(customEvent);
	};

	const Show = (selector: TElement, displayType?: string) =>
		!Type.IsString(displayType) ? RemoveStyle(selector, 'display') : SetStyle(selector, 'display', displayType);
	const Hide = (selector: TElement) => SetStyle(selector, 'display', 'none');
	const IsHidden = (selector: TElement): boolean => GetStyle(selector, 'display') === 'none';

	const Create = (tagName: string, option?: Record<string, TCreateOption>): HTMLElement => {
		const newElement = Doc.createElement(tagName);
		if (!option) return newElement;

		if (option.attrs && (Type.IsArray(option.attrs) || Type.IsObject(option.attrs)))
			SetAttrs(newElement, option.attrs as Record<string, string>);

		if (option.styles && Type.IsObject(option.styles)) SetStyles(newElement, option.styles as Record<string, string>);
		else if (option.styles && Type.IsString(option.styles)) SetStyleText(newElement, option.styles);

		if (option.class && Type.IsString(option.class)) newElement.className = option.class;
		else if (option.class && Type.IsArray(option.class)) AddClass(newElement, ...option.class as string[]);

		if (option.html && Type.IsString(option.html)) SetHTML(newElement, option.html);

		if (option.children && Type.IsArray(option.children))
			Arr.Each(option.children as TElement[] | (string | TElement)[], child => Insert(newElement, child));

		return newElement;
	};

	const RemoveChildren = (selector: TElement, bBubble: boolean = false) => {
		const children = GetChildren(selector);
		if (Arr.IsEmpty(children)) return;
		Arr.Each(children, child => EventUtils.UnbindAll(child));

		if (!bBubble) return;

		Arr.Each(children, child => {
			RemoveChildren(child, bBubble);
			child.remove();
		});
	};

	const Remove = (selector: TElement, bBubble: boolean = false) => {
		if (!NodeType.IsElement(selector)) {
			if (Obj.HasProperty<Element>(selector, 'remove')) selector.remove();
			return;
		}
		EventUtils.UnbindAll(selector);

		if (bBubble) RemoveChildren(selector, bBubble);

		selector.remove();
	};

	return {
		Win,
		Doc,
		Utils,
		EventUtils,
		Element: DOMElement,
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
		GetOuterHTML,
		SetText,
		SetHTML,
		SetOuterHTML,
		InsertBefore,
		InsertFirst,
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
		Dispatch,
		Show,
		Hide,
		IsHidden,
		CreateFragment,
		CreateTextNode,
		Create,
		RemoveChildren,
		Remove,
	};
};

export default DOM({ bEditor: false });