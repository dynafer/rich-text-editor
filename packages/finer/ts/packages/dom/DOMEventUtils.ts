import { Arr, Obj, Type } from '@dynafer/utils';

export type TEventTarget = (Window & typeof globalThis) | Document | Element;

interface IBoundEvent {
	element: TEventTarget,
	eventMap: Record<string, EventListener[]>,
}

export interface IDOMEventUtils {
	Bind: (target: TEventTarget, eventName: string, event: EventListener) => void,
	Unbind: (target: TEventTarget, eventName: string, event: EventListener) => void,
	UnbindAll: (target: TEventTarget, eventName?: string) => void,
	Destroy: () => void,
}

const DOMEventUtils = (): IDOMEventUtils => {
	const boundEvents: Record<string, IBoundEvent> = {};

	const propertyName = 'finer-boundary-id';

	const createBoundaryId = () => {
		let date = new Date().getTime();
		return 'xxxxyxxx-xxxx-yxxx'.replace(/[xy]/g, char => {
			const r = (date + Math.random() * 16) % 16 | 0;
			date = Math.floor(date / 16);
			return (char === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	};

	const getElementBoundaryId = (target: TEventTarget): string => {
		const boundaryId = Obj.GetProperty<string>(target, propertyName) ?? createBoundaryId();
		if (!Obj.HasProperty(target, propertyName)) Object.assign(target)[propertyName] = boundaryId;
		return boundaryId;
	};

	const Bind = (target: TEventTarget, eventName: string, event: EventListener) => {
		const boundaryId = getElementBoundaryId(target);
		if (!boundEvents[boundaryId]) boundEvents[boundaryId] = {
			element: target,
			eventMap: {}
		};

		if (!boundEvents[boundaryId].eventMap[eventName]) boundEvents[boundaryId].eventMap[eventName] = [];
		Arr.Push(boundEvents[boundaryId].eventMap[eventName], event);
		target.addEventListener(eventName, event);
	};

	const Unbind = (target: TEventTarget, eventName: string, event: EventListener) => {
		const boundaryId = getElementBoundaryId(target);
		const events = boundEvents[boundaryId]?.eventMap[eventName];
		if (!events) return;

		let index = Arr.Find(events, event);
		while (index !== -1) {
			Arr.Remove(events, event, index);
			target.removeEventListener(eventName, event);
			index = Arr.Find(events, event);
		}
	};

	const unbindRecursive = (target: TEventTarget, eventName: string, events?: EventListener[]): void => {
		if (!Type.IsArray(events)) return;

		const event = Arr.Shift(events);
		if (!Type.IsFunction(event)) return;
		target.removeEventListener(eventName, event);
		return unbindRecursive(target, eventName, events);
	};

	const UnbindAll = (target: TEventTarget, eventName?: string) => {
		const boundaryId = getElementBoundaryId(target);
		const boundEvent = boundEvents[boundaryId];
		if (!boundEvent) return;

		if (Type.IsString(eventName)) {
			const events = boundEvent.eventMap[eventName];
			return unbindRecursive(target, eventName, events);
		}

		Obj.Entries(boundEvent.eventMap, (name, events) => unbindRecursive(target, name, events));
		delete boundEvents?.[boundaryId];
	};

	const Destroy = () =>
		Obj.Values(boundEvents, boundEvent => UnbindAll(boundEvent.element));

	return {
		Bind,
		Unbind,
		UnbindAll,
		Destroy,
	};
};

export default DOMEventUtils;