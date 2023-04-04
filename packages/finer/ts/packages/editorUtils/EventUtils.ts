import { Arr, Obj } from '@dynafer/utils';

export interface IEvent<T = unknown> {
	(...params: T[]): void;
}

export interface IEventUtils {
	Has: (eventName: string) => boolean,
	On: (eventName: string, event: IEvent) => void,
	Off: (eventName: string, event: IEvent) => void,
	OffAll: () => void,
	Dispatch: (eventName: string, ...params: unknown[]) => void,
	Get: () => Record<string, IEvent[]>,
}

const EventUtils = (): IEventUtils => {
	const events: Record<string, IEvent[]> = {};

	const Has = (eventName: string): boolean => !!events[eventName];

	const On = (eventName: string, event: IEvent) => {
		if (!Has(eventName)) events[eventName] = [];

		Arr.Push(events[eventName], event);
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
		if (!Has(eventName)) return;

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

	const Get = (): Record<string, IEvent[]> => events;

	return {
		Has,
		On,
		Off,
		OffAll,
		Dispatch,
		Get,
	};
};

export default EventUtils;