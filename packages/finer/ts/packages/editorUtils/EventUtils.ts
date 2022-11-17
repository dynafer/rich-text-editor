export interface IEvent {
	(...params: unknown[]): void;
}

export interface IEventUtils {
	Has: (eventName: string) => boolean,
	On: (eventName: string, event: IEvent) => void,
	Off: (eventName: string, event: IEvent) => void,
	Dispatch: (eventName: string, ...params: unknown[]) => void,
	Get: () => Record<string, IEvent[]>,
}

const EventUtils = (): IEventUtils => {
	const events: Record<string, IEvent[]> = {};

	const Has = (eventName: string): boolean => !!events[eventName];

	const On = (eventName: string, event: IEvent) => {
		if (!Has(eventName)) events[eventName] = [];

		events[eventName].push(event);
	};

	const Off = (eventName: string, event: IEvent) => {
		if (!Has(eventName)) return;

		let deletedCount = 0;
		for (let index = 0, length = events[eventName].length; index < length; ++index) {
			if (events[eventName][index - deletedCount] === event) {
				events[eventName].splice(index - deletedCount, 1);
				++deletedCount;
			}
		}
	};

	const Dispatch = (eventName: string, ...params: unknown[]) => {
		if (!Has(eventName)) return;

		const eventList: Promise<void>[] = [];
		for (const event of events[eventName]) {
			eventList.push(new Promise((resolve) => {
				event(...params);
				resolve();
			}));
		}

		Promise.all(eventList)
			.catch(() => { });
	};

	const Get = (): Record<string, IEvent[]> => events;

	return {
		Has,
		On,
		Off,
		Dispatch,
		Get,
	};
};

export default EventUtils;