import { Type } from '@dynafer/utils';
import Editor from 'finer/packages/Editor';
import { IEventSetupCallback, PreventEvent, Setup } from '../EventSetupUtils';

export enum EKeyCode {
	ArrowUp = 'ArrowUp',
	ArrowDown = 'ArrowDown',
	ArrowLeft = 'ArrowLeft',
	ArrowRight = 'ArrowRight',
	Backspace = 'Backspace',
	Delete = 'Delete',
	Home = 'Home',
	End = 'End',
	PageUp = 'PageUp',
	PageDown = 'PageDown',

	Digit0 = 'Digit0',
	Digit1 = 'Digit1',
	Digit2 = 'Digit2',
	Digit3 = 'Digit3',
	Digit4 = 'Digit4',
	Digit5 = 'Digit5',
	Digit6 = 'Digit6',
	Digit7 = 'Digit7',
	Digit8 = 'Digit8',
	Digit9 = 'Digit9',

	KeyA = 'KeyA',
	KeyB = 'KeyB',
	KeyC = 'KeyC',
	KeyD = 'KeyD',
	KeyE = 'KeyE',
	KeyF = 'KeyF',
	KeyG = 'KeyG',
	KeyH = 'KeyH',
	KeyI = 'KeyI',
	KeyJ = 'KeyJ',
	KeyK = 'KeyK',
	KeyL = 'KeyL',
	KeyM = 'KeyM',
	KeyN = 'KeyN',
	KeyO = 'KeyO',
	KeyP = 'KeyP',
	KeyQ = 'KeyQ',
	KeyR = 'KeyR',
	KeyS = 'KeyS',
	KeyT = 'KeyT',
	KeyU = 'KeyU',
	KeyV = 'KeyV',
	KeyW = 'KeyW',
	KeyX = 'KeyX',
	KeyY = 'KeyY',
	KeyZ = 'KeyZ',
}

export const SetupKeyboard = <K extends keyof GlobalEventHandlersEventMap>(editor: Editor, eventName: K, keyCode: EKeyCode, callback: IEventSetupCallback<K>) => {
	const newEvent = (self: Editor, event: GlobalEventHandlersEventMap[K]) => {
		const keyEvent = event as KeyboardEvent;
		if (keyEvent.key !== keyCode && keyEvent.code !== keyCode) return;
		callback(self, event);
	};

	Setup(editor, eventName, newEvent);
};

export const SetupWith = <K extends keyof GlobalEventHandlersEventMap>(editor: Editor, eventName: K, keyCode: EKeyCode, option: Record<string, boolean>, callback: IEventSetupCallback<K>) => {
	const { bCtrl, bAlt, bShift, bPrevent } = option;
	const canProcess = (event: KeyboardEvent): boolean => {
		if (Type.IsBoolean(bCtrl) && bCtrl && !event.ctrlKey) return false;
		if (Type.IsBoolean(bAlt) && bAlt && !event.altKey) return false;
		if (Type.IsBoolean(bShift) && bShift && !event.shiftKey) return false;
		if (Type.IsBoolean(bPrevent) && bPrevent) PreventEvent(event);

		return true;
	};

	const newEvent = (self: Editor, event: GlobalEventHandlersEventMap[K]) => {
		const keyEvent = event as KeyboardEvent;
		if ((keyEvent.key !== keyCode && keyEvent.code !== keyCode) || !canProcess(keyEvent)) return;
		callback(self, event);
	};

	Setup(editor, eventName, newEvent);
};