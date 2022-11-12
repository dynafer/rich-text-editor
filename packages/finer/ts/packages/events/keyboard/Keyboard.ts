import Editor from '../../Editor';
import { CaretChangeEvent, ENativeEvents, IEventSetupCallback, Setup } from '../EventSetupUtils';
import DefaultEvent from './Default';
import { EKeyCode } from './KeyboardUtils';

const Keyboard = (editor: Editor) => {
	const setup = <K extends keyof GlobalEventHandlersEventMap>(eventName: K, keyCode: EKeyCode, event: IEventSetupCallback<K>) => {
		const newEvent = (self: Editor, keyEvent: GlobalEventHandlersEventMap[K]) => {
			if ((keyEvent as KeyboardEvent).key !== keyCode) return;
			event(self, keyEvent);
		};

		Setup(editor, eventName, newEvent);
	};

	const setupWithCtrl = <K extends keyof GlobalEventHandlersEventMap>(eventName: K, keyCode: EKeyCode, event: IEventSetupCallback<K>) => {
		const newEvent = (self: Editor, keyEvent: GlobalEventHandlersEventMap[K]) => {
			if ((keyEvent as KeyboardEvent).code !== keyCode || !(keyEvent as KeyboardEvent).ctrlKey) return;
			event(self, keyEvent);
		};

		Setup(editor, eventName, newEvent);
	};

	Setup(editor, ENativeEvents.keyup, DefaultEvent);
	Setup(editor, ENativeEvents.keypress, DefaultEvent);
	Setup(editor, ENativeEvents.keydown, DefaultEvent);

	setup(ENativeEvents.keyup, EKeyCode.ArrowUp, CaretChangeEvent);
	setup(ENativeEvents.keyup, EKeyCode.ArrowDown, CaretChangeEvent);
	setup(ENativeEvents.keyup, EKeyCode.ArrowLeft, CaretChangeEvent);
	setup(ENativeEvents.keyup, EKeyCode.ArrowRight, CaretChangeEvent);
	setup(ENativeEvents.keyup, EKeyCode.Home, CaretChangeEvent);
	setup(ENativeEvents.keyup, EKeyCode.End, CaretChangeEvent);
	setup(ENativeEvents.keyup, EKeyCode.PageDown, CaretChangeEvent);
	setup(ENativeEvents.keyup, EKeyCode.PageUp, CaretChangeEvent);

	setupWithCtrl(ENativeEvents.keyup, EKeyCode.KeyA, CaretChangeEvent);
};

export default Keyboard;