export interface IEvent {
	(...params: unknown[]): void
}

export interface IEventUtils {
	Has: (eventName: string) => boolean,
	On: (eventName: string, event: IEvent) => void,
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

	const Dispatch = (eventName: string, ...params: unknown[]) => {
		if (!Has(eventName)) return;

		for (const event of events[eventName]) {
			event(...params);
		}
	};

	const Get = (): Record<string, IEvent[]> => events;

	return {
		Has,
		On,
		Dispatch,
		Get,
	};
};

export default EventUtils;