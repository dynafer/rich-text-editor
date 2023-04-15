import { Arr, Obj, Type, Utils } from '@dynafer/utils';

export type TEventTarget = (Window & typeof globalThis) | Document | Element;

interface IBoundEvent {
	element: TEventTarget,
	eventMap: Record<string, EventListener[]>,
}

export interface IDOMEventUtils {
	Boundaries: Record<string, IBoundEvent>,
	Bind: (target: TEventTarget, eventName: string, event: EventListener) => void,
	Unbind: (target: TEventTarget, eventName: string, event: EventListener) => void,
	UnbindAll: (target: TEventTarget, eventName?: string) => void,
	Destroy: () => void,
}

const DOMEventUtils = (): IDOMEventUtils => {
	const boundaries: Record<string, IBoundEvent> = {};

	const propertyName = 'finer-boundary-id';

	const hasElementBoundaryId = (target: TEventTarget): boolean => Obj.HasProperty(target, propertyName);

	const getElementBoundaryId = (target: TEventTarget): string => {
		const bHasId = hasElementBoundaryId(target);
		const boundaryId = Obj.GetProperty<string>(target, propertyName) ?? Utils.CreateUUID();
		if (!bHasId) Obj.SetProperty(target, propertyName, boundaryId);
		return boundaryId;
	};

	const Bind = (target: TEventTarget, eventName: string, event: EventListener) => {
		const boundaryId = getElementBoundaryId(target);
		if (!boundaries[boundaryId]) boundaries[boundaryId] = {
			element: target,
			eventMap: {}
		};

		if (!boundaries[boundaryId].eventMap[eventName]) boundaries[boundaryId].eventMap[eventName] = [];
		Arr.Push(boundaries[boundaryId].eventMap[eventName], event);
		target.addEventListener(eventName, event);
	};

	const Unbind = (target: TEventTarget, eventName: string, event: EventListener) => {
		if (!hasElementBoundaryId(target)) return;

		const boundaryId = getElementBoundaryId(target);
		const events = boundaries[boundaryId]?.eventMap[eventName];
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
		const boundEvent = boundaries[boundaryId];
		if (!boundEvent) return;

		if (Type.IsString(eventName)) {
			const events = boundEvent.eventMap[eventName];
			return unbindRecursive(target, eventName, events);
		}

		Obj.Entries(boundEvent.eventMap, (name, events) => unbindRecursive(target, name, events));
		delete boundaries?.[boundaryId];
	};

	const Destroy = () =>
		Obj.Values(boundaries, boundEvent => UnbindAll(boundEvent.element));

	return {
		Boundaries: boundaries,
		Bind,
		Unbind,
		UnbindAll,
		Destroy,
	};
};

export default DOMEventUtils();