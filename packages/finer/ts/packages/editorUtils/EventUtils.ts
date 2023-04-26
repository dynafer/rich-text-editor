import { NodeType } from '@dynafer/dom-control';
import { Arr, Obj } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { ENativeEvents } from '../events/EventSetupUtils';

export interface IEvent<T = unknown> {
	(...params: T[]): void;
}

export interface IEventUtils {
	Get: () => Record<string, IEvent[]>,
	GetEvents: (eventName: string) => IEvent[],
	Has: (eventName: string) => boolean,
	Resolve: () => void,
	On: (eventName: string, event: IEvent, bFirst?: boolean) => void,
	Off: (eventName: string, event: IEvent) => void,
	OffAll: () => void,
	Dispatch: (eventName: string, ...params: unknown[]) => void,
}

const EventUtils = (editor: Editor): IEventUtils => {
	const self = editor;

	const events: Record<string, IEvent[]> = {};
	const pendingNatives: ENativeEvents[] = [];

	const Get = (): Record<string, IEvent[]> => events;
	const GetEvents = (eventName: string): IEvent[] => events[eventName] ?? [];
	const Has = (eventName: string): boolean => !!events[eventName];

	const initNative = (eventName: string) =>
		DOM.On(self.GetBody(), eventName, evt => {
			if (self.IsReadOnly()) return;

			self.DOM.EventUtils.FindAndUnbindDetached()
				.catch(console.error);

			Arr.Each(GetEvents(eventName), (event, exit) => {
				if (evt.defaultPrevented) return exit();
				event(evt);
			});
		});

	const addNative = (eventName: string) => {
		if (!ENativeEvents[eventName as ENativeEvents] || Has(eventName) || Arr.Contains(pendingNatives, eventName)) return;
		if (!NodeType.IsElement(self.GetBody())) return Arr.Push(pendingNatives, eventName);
		initNative(eventName);
	};

	const Resolve = () => {
		if (!NodeType.IsElement(self.GetBody())) return;
		Arr.WhileShift(pendingNatives, eventName => initNative(eventName));
	};

	const On = (eventName: string, event: IEvent, bFirst: boolean = false) => {
		addNative(eventName);

		if (!Has(eventName)) events[eventName] = [];

		const add = bFirst ? Arr.Unshift : Arr.Push;
		add(events[eventName], event);
	};

	const Off = (eventName: string, event: IEvent) => {
		if (!Has(eventName)) return;

		let deletedCount = 0;
		for (let index = 0, length = events[eventName].length; index < length; ++index) {
			if (events[eventName][index - deletedCount] !== event) continue;
			Arr.Remove(events[eventName], index - deletedCount);
			++deletedCount;
		}
	};

	const OffAll = () =>
		Obj.Entries(events, (eventName, eventList) => {
			Arr.Clean(eventList);
			delete events?.[eventName];
		});

	const Dispatch = (eventName: string, ...params: unknown[]) => {
		if (!Has(eventName) || self.IsReadOnly()) return;

		self.DOM.EventUtils.FindAndUnbindDetached()
			.catch(console.error);

		const eventList: Promise<void>[] = [];
		Arr.Each(events[eventName], event =>
			Arr.Push(eventList, new Promise((resolve) => {
				event(...params);
				resolve();
			}))
		);

		Promise.all(eventList)
			.catch(console.error);
	};

	return {
		Get,
		GetEvents,
		Has,
		Resolve,
		On,
		Off,
		OffAll,
		Dispatch,
	};
};

export default EventUtils;