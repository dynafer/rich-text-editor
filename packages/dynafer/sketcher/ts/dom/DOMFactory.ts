import { Inserter } from '@dynafer/dom-control';
import { Arr, Obj, Type, UID } from '@dynafer/utils';

export type TEventListener<K extends keyof GlobalEventHandlersEventMap> = (event: GlobalEventHandlersEventMap[K]) => void;

const factoryMap: Record<string, DOMFactory> = {};

class DOMFactory<T extends HTMLElement = HTMLElement> {
	public static readonly FACTORY_PROPERTY_NAME: string = 'factory-boundary-id';

	public readonly Doc = document;
	public readonly Self: T;

	private readonly Id: string;
	private readonly boundEvents: Record<string, EventListener[]> = {};
	private readonly rootBoundEvents: Record<string, EventListener[]> = {};

	constructor(creation: string) {
		if (!Type.IsString(creation)) creation = 'div';

		this.Self = this.Doc.createElement(creation) as T;
		this.Id = UID.CreateUUID();

		Obj.SetProperty(this.Self, DOMFactory.FACTORY_PROPERTY_NAME, this.Id);
		factoryMap[this.Id] = this;
	}

	public static FindFactory(element: Element): DOMFactory | null {
		const id = Obj.GetProperty<string>(element, DOMFactory.FACTORY_PROPERTY_NAME);
		return !id ? null : (factoryMap[id] ?? null);
	}

	public BindRoot<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>, bCapture?: boolean): void;
	public BindRoot(eventName: string, event: EventListener, bCapture?: boolean): void;
	public BindRoot(eventName: string, event: EventListener, bCapture: boolean = false) {
		if (!this.rootBoundEvents[eventName]) this.rootBoundEvents[eventName] = [];
		if (Arr.Contains(this.rootBoundEvents[eventName], event)) return;
		document.addEventListener(eventName, event, bCapture);
		Arr.Push(this.rootBoundEvents[eventName], event);
	}

	public UnbindRoot<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>): void;
	public UnbindRoot(eventName: string, event: EventListener): void;
	public UnbindRoot(eventName: string, event: EventListener) {
		document.removeEventListener(eventName, event, true);
		document.removeEventListener(eventName, event, false);
		if (this.rootBoundEvents[eventName]) this.rootBoundEvents[eventName] = this.rootBoundEvents[eventName].filter(bound => bound !== event);
	}

	public GetBody(): HTMLElement { return this.Doc.body; }
	public GetId(): string { return this.Id; }

	public Insert(...factories: (DOMFactory | string)[]) {
		Arr.Each(factories, factory => Inserter.AfterInner(this.Self, Type.IsString(factory) ? factory : factory.Self));
	}

	public AddClass(...classes: string[]) { this.Self.classList.add(...classes); }
	public HasClass(className: string): boolean { return this.Self.classList.contains(className); }
	public RemoveClass(...classes: string[]) { this.Self.classList.remove(...classes); }

	public Bind<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>, bCapture?: boolean): void;
	public Bind(eventName: string, event: EventListener, bCapture?: boolean): void;
	public Bind(eventName: string, event: EventListener, bCapture: boolean = false) {
		if (!this.boundEvents[eventName]) this.boundEvents[eventName] = [];
		if (Arr.Contains(this.boundEvents[eventName], event)) return;
		this.Self.addEventListener(eventName, event, bCapture);
		Arr.Push(this.boundEvents[eventName], event);
	}

	public Unbind<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>): void;
	public Unbind(eventName: string, event: EventListener): void;
	public Unbind(eventName: string, event: EventListener) {
		this.Self.removeEventListener(eventName, event, true);
		this.Self.removeEventListener(eventName, event, false);
		if (this.boundEvents[eventName]) this.boundEvents[eventName] = this.boundEvents[eventName].filter(bound => bound !== event);
	}

	public Dispatch(eventName: string) { this.Self.dispatchEvent(new Event(eventName)); }

	public GetChildren<K extends HTMLElement = HTMLElement>(bFactories?: true): DOMFactory<K>[];
	public GetChildren(bFactories: false): Element[];
	public GetChildren(bFactories: boolean = true) {
		if (!bFactories) return Arr.Convert(this.Self.children);

		const factories: DOMFactory[] = [];
		Arr.Each(Arr.Convert(this.Self.children), child => {
			const factory = DOMFactory.FindFactory(child);
			if (!factory) return;
			Arr.Push(factories, factory);
		});

		return factories;
	}

	public Destroy() {
		Arr.WhileShift(this.GetChildren(), child => child.Destroy());
		Arr.WhileShift(this.GetChildren(false), child => child.remove());

		this.Dispatch('Factory:Destroyed');

		Obj.Entries(this.boundEvents, (eventName, events) => {
			Arr.WhileShift(events, event => this.Unbind(eventName, event));
			delete this.boundEvents?.[eventName];
		});

		Obj.Entries(this.rootBoundEvents, (eventName, events) => {
			Arr.WhileShift(events, event => this.UnbindRoot(eventName, event));
			delete this.rootBoundEvents?.[eventName];
		});

		delete factoryMap?.[this.Id];
		this.Self.remove();
	}
}

export default DOMFactory;