import { Insert } from '@dynafer/dom-control';

export type TEventListener<K extends keyof GlobalEventHandlersEventMap> = (event: GlobalEventHandlersEventMap[K]) => void;

export interface IDOMFactory<E = HTMLElement> {
	Doc: Document,
	Self: E,
	GetBody: () => HTMLElement,
	Insert: (...factories: IDOMFactory[]) => IDOMFactory[],
	InsertHtml: (html: string) => void,
	AddClass: (...classes: string[]) => void,
	HasClass: (className: string) => boolean,
	RemoveClass: (...classes: string[]) => void,
	Bind: {
		<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>, bCapture?: boolean): void;
		(eventName: string, event: EventListener, bCapture?: boolean): void;
	},
	Unbind: {
		<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>, bCapture?: boolean): void;
		(eventName: string, event: EventListener, bCapture?: boolean): void;
	},
	GetChildren: () => IDOMFactory[],
	Destroy: () => void,
}

export interface IDOMFactoryConstructor {
	<K extends keyof HTMLElementTagNameMap>(creation: K): IDOMFactory<HTMLElementTagNameMap[K]>;
	(creation: string): IDOMFactory;
}

const DOMFactory: IDOMFactoryConstructor = (creation: string): IDOMFactory => {
	const Doc = document;
	const bindedEvents: Record<string, EventListener[]> = {};
	const children: IDOMFactory[] = [];

	const Self: HTMLElement = Doc.createElement(creation);

	const GetBody = () => Doc.body;

	const InsertFactory = (...factories: IDOMFactory[]): IDOMFactory[] => {
		for (const child of factories) {
			if (!child) continue;

			Insert.AfterInner(Self, child.Self);
			children.push(child);
		}

		return children;
	};

	const InsertHtml = (html: string) => {
		Self.insertAdjacentHTML('beforeend', html);
	};

	const AddClass = (...classes: string[]) => Self.classList.add(...classes);
	const HasClass = (className: string): boolean => Self.classList.contains(className);
	const RemoveClass = (...classes: string[]) => Self.classList.remove(...classes);

	const Bind = (eventName: string, event: EventListener, bCapture: boolean = false) => {
		if (!bindedEvents[eventName]) bindedEvents[eventName] = [];
		if (bindedEvents[eventName].includes(event)) return;
		Self.addEventListener(eventName, event, bCapture);
		bindedEvents[eventName].push(event);
	};

	const Unbind = (eventName: string, event: EventListener, bCapture: boolean = false) => {
		if (bindedEvents[eventName]) {
			bindedEvents[eventName] = bindedEvents[eventName].filter(binded => binded[0] !== event);
		}
		Self.removeEventListener(eventName, event, bCapture);
	};

	const Dispatch = (eventName: string) => {
		Self.dispatchEvent(new Event(eventName));
	};

	const GetChildren = (): IDOMFactory[] => children;

	const Destroy = () => {
		for (const child of children) {
			child.Destroy();
		}

		children.splice(0, children.length);

		Dispatch('destroyed');

		for (const [eventName, events] of Object.entries(bindedEvents)) {
			for (const event of events) {
				Unbind(eventName, event);
			}
		}

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
		Unbind,
		GetChildren,
		Destroy,
	};
};

export default DOMFactory;