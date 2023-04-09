import { Inserter } from '@dynafer/dom-control';
import { Arr, Obj } from '@dynafer/utils';

export type TEventListener<K extends keyof GlobalEventHandlersEventMap> = (event: GlobalEventHandlersEventMap[K]) => void;

export interface IDOMFactory<E extends HTMLElement = HTMLElement> {
	readonly Doc: Document,
	readonly Self: E,
	GetBody: () => HTMLElement,
	Insert: <T extends HTMLElement>(...factories: IDOMFactory<T>[]) => IDOMFactory<T>[],
	InsertHtml: (html: string) => void,
	AddClass: (...classes: string[]) => void,
	HasClass: (className: string) => boolean,
	RemoveClass: (...classes: string[]) => void,
	Bind: {
		<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>, bCapture?: boolean): void;
		(eventName: string, event: EventListener, bCapture?: boolean): void;
	},
	BindRoot: {
		<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>, bCapture?: boolean): void;
		(eventName: string, event: EventListener, bCapture?: boolean): void;
	},
	Unbind: {
		<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>): void;
		(eventName: string, event: EventListener): void;
	},
	UnbindRoot: {
		<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>): void;
		(eventName: string, event: EventListener): void;
	},
	GetChildren: <T extends HTMLElement>() => IDOMFactory<T>[],
	Destroy: () => void,
}

export interface IDOMFactoryConstructor {
	<K extends keyof HTMLElementTagNameMap>(creation: K): IDOMFactory;
	(creation: string): IDOMFactory;
}

const DOMFactory: IDOMFactoryConstructor = <E extends HTMLElement>(creation: string): IDOMFactory<E> => {
	const Doc = document;
	const boundEvents: Record<string, EventListener[]> = {};
	const rootBoundEvents: Record<string, EventListener[]> = {};
	const children: IDOMFactory[] = [];

	const Self = Doc.createElement(creation) as E;

	const GetBody = () => Doc.body;

	const InsertFactory = <T extends HTMLElement>(...factories: IDOMFactory<T>[]): IDOMFactory<T>[] => {
		Arr.Each(factories, child => {
			if (!child) return;
			Inserter.AfterInner(Doc, Self, child.Self);
			Arr.Push(children, child);
		});

		return children as IDOMFactory<T>[];
	};

	const InsertHtml = (html: string) => Inserter.AfterInner(Doc, Self, html);

	const AddClass = (...classes: string[]) => Self.classList.add(...classes);
	const HasClass = (className: string): boolean => Self.classList.contains(className);
	const RemoveClass = (...classes: string[]) => Self.classList.remove(...classes);

	const Bind = (eventName: string, event: EventListener, bCapture: boolean = false) => {
		if (!boundEvents[eventName]) boundEvents[eventName] = [];
		if (Arr.Contains(boundEvents[eventName], event)) return;
		Self.addEventListener(eventName, event, bCapture);
		Arr.Push(boundEvents[eventName], event);
	};

	const BindRoot = (eventName: string, event: EventListener, bCapture: boolean = false) => {
		if (!rootBoundEvents[eventName]) rootBoundEvents[eventName] = [];
		if (Arr.Contains(rootBoundEvents[eventName], event)) return;
		Doc.addEventListener(eventName, event, bCapture);
		Arr.Push(rootBoundEvents[eventName], event);
	};

	const Unbind = (eventName: string, event: EventListener) => {
		Self.removeEventListener(eventName, event, true);
		Self.removeEventListener(eventName, event, false);
		if (boundEvents[eventName]) boundEvents[eventName] = boundEvents[eventName].filter(bound => bound !== event);
	};

	const UnbindRoot = (eventName: string, event: EventListener) => {
		Doc.removeEventListener(eventName, event, true);
		Doc.removeEventListener(eventName, event, false);
		if (rootBoundEvents[eventName]) rootBoundEvents[eventName] = rootBoundEvents[eventName].filter(bound => bound !== event);
	};

	const Dispatch = (eventName: string) => Self.dispatchEvent(new Event(eventName));

	const GetChildren = <T extends HTMLElement>(): IDOMFactory<T>[] => children as IDOMFactory<T>[];

	const Destroy = () => {
		Arr.Each(children, child => child.Destroy());

		Arr.Clean(children);

		Dispatch('destroyed');

		Obj.Entries(boundEvents, (eventName, events) => Arr.Each(events, event => Unbind(eventName, event)));
		Obj.Entries(rootBoundEvents, (eventName, events) => Arr.Each(events, event => UnbindRoot(eventName, event)));

		Self.remove();
	};

	return {
		Doc,
		Self,
		GetBody,
		Insert: InsertFactory,
		InsertHtml,
		AddClass,
		HasClass,
		RemoveClass,
		Bind,
		BindRoot,
		Unbind,
		UnbindRoot,
		GetChildren,
		Destroy,
	};
};

export default DOMFactory;