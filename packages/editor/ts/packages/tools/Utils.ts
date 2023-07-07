import { Arr, Obj } from '@dynafer/utils';
import Editor from '../Editor';
import { ENativeEvents, PreventEvent } from '../events/EventSetupUtils';

type TListenerCallback = (event: MouseEvent | Touch) => void;

export const RegisterStartEvent = (editor: Editor, callback: TListenerCallback, ...targets: Element[]) => {
	const self = editor;
	const DOM = self.DOM;

	const startEvent = (evt: MouseEvent | TouchEvent) => {
		PreventEvent(evt);
		const event = !Obj.HasProperty<TouchEvent>(evt, 'touches') ? evt : evt.touches.item(0);
		if (!event) return;

		callback(event);
	};

	Arr.Each(targets, target => DOM.On(target, ENativeEvents.mousedown, startEvent));
	Arr.Each(targets, target => DOM.On(target, ENativeEvents.touchstart, startEvent));
};

export const RegisterMoveFinishEvents = (editor: Editor, moveCallback: TListenerCallback, finishCallback: TListenerCallback, bRoot: boolean = false) => {
	const self = editor;
	const DOM = self.DOM;

	const boundEvents: [(Window & typeof globalThis), ENativeEvents, EventListener][] = [];

	const removeEvents = () => Arr.WhileShift(boundEvents, boundEvent => DOM.Off(boundEvent[0], boundEvent[1], boundEvent[2]));

	const adjust = (evt: MouseEvent | TouchEvent) => {
		PreventEvent(evt);
		const event = !Obj.HasProperty<TouchEvent>(evt, 'touches') ? evt : evt.touches.item(0);
		if (!event) return;

		moveCallback(event);
	};

	const finish = (evt: MouseEvent | TouchEvent) => {
		PreventEvent(evt);
		const event = !Obj.HasProperty<TouchEvent>(evt, 'touches') ? evt : evt.touches.item(0);
		if (!event) return;

		finishCallback(event);
		removeEvents();
	};

	const win = bRoot ? window : self.GetWin();

	Arr.Push(boundEvents,
		[win, ENativeEvents.mousemove, adjust],
		[win, ENativeEvents.touchmove, adjust],
		[win, ENativeEvents.mouseup, finish],
		[win, ENativeEvents.touchend, finish],
		[window, ENativeEvents.mouseup, finish],
		[window, ENativeEvents.touchend, finish],
	);

	Arr.Each(boundEvents, boundEvent => DOM.On(boundEvent[0], boundEvent[1], boundEvent[2]));
};
