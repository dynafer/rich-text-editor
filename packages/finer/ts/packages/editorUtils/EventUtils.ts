export type TEventParameter = Event | string | number | KeyboardEvent;
export type TEvent = (...params: TEventParameter[]) => void;

export interface IEventUtils {
	Has: (eventName: string) => boolean,
	On: (eventName: string, event: TEvent) => void,
	Dispatch: (eventName: string, ...params: TEventParameter[]) => void,
}

const EventUtils = (): IEventUtils => {
	const events: Record<string, TEvent[]> = {};

	const Has = (eventName: string): boolean => !!events[eventName];

	const On = (eventName: string, event: TEvent) => {
		if (!events[eventName]) events[eventName] = [];

		events[eventName].push(event);
	};

	const Dispatch = (eventName: string, ...params: TEventParameter[]) => {
		if (!Has(eventName)) return;

		for (const event of events[eventName]) {
			event(...params);
		}
	};

	return {
		Has,
		On,
		Dispatch
	};
};

export default EventUtils();