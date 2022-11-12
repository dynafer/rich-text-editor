import Editor from '../../Editor';
import { CaretChangeEvent, EEventNames, IEventSetupCallback, Setup } from '../EventSetupUtils';
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

	Setup(editor, EEventNames.keyup, DefaultEvent);
	Setup(editor, EEventNames.keypress, DefaultEvent);
	Setup(editor, EEventNames.keydown, DefaultEvent);

	setup(EEventNames.keyup, EKeyCode.ArrowUp, CaretChangeEvent);
	setup(EEventNames.keyup, EKeyCode.ArrowDown, CaretChangeEvent);
	setup(EEventNames.keyup, EKeyCode.ArrowLeft, CaretChangeEvent);
	setup(EEventNames.keyup, EKeyCode.ArrowRight, CaretChangeEvent);
	setup(EEventNames.keyup, EKeyCode.Home, CaretChangeEvent);
	setup(EEventNames.keyup, EKeyCode.End, CaretChangeEvent);
	setup(EEventNames.keyup, EKeyCode.PageDown, CaretChangeEvent);
	setup(EEventNames.keyup, EKeyCode.PageUp, CaretChangeEvent);

	setupWithCtrl(EEventNames.keyup, EKeyCode.KeyA, CaretChangeEvent);
};

export default Keyboard;