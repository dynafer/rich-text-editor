import { Arr, Obj, Type, Utils } from '@dynafer/utils';

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

	const hasElementBoundaryId = (target: TEventTarget): boolean => !Obj.HasProperty(target, propertyName);

	const getElementBoundaryId = (target: TEventTarget): string => {
		const boundaryId = Obj.GetProperty<string>(target, propertyName) ?? Utils.CreateUUID();
		if (!hasElementBoundaryId(target)) Obj.SetProperty(target, propertyName, boundaryId);
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
		if (!hasElementBoundaryId(target)) return;

		const boundaryId = getElementBoundaryId(target);
		const events = boundEvents[boundaryId]?.eventMap[eventName];
		if (!events) return;

		let index = Arr.Find(events, event);
		while (index !== -1) {
			Arr.Remove(events, index);
			target.removeEventListener(eventName, event);
			index = Arr.Find(events, event);
		}
	};

	const unbindRecursive = (target: TEventTarget, eventName: string, events: EventListener[]): void => {
		const event = Arr.Shift(events);
		if (!Type.IsFunction(event)) return;
		target.removeEventListener(eventName, event);
		unbindRecursive(target, eventName, events);
	};

	const UnbindAll = (target: TEventTarget, eventName?: string) => {
		if (!hasElementBoundaryId(target)) return;

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

export default DOMEventUtils();