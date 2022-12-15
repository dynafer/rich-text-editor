import Editor from '../../Editor';
import { CaretChangeEvent, ENativeEvents, Setup } from '../EventSetupUtils';
import DefaultEvent from './Default';
import { EKeyCode, SetupWith, SetupKeyboard } from './KeyboardUtils';

const Keyboard = (editor: Editor) => {
	const self = editor;

	Setup(self, ENativeEvents.keyup, DefaultEvent);
	Setup(self, ENativeEvents.keypress, DefaultEvent);
	Setup(self, ENativeEvents.keydown, DefaultEvent);

	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowUp, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowDown, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowLeft, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowRight, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.Home, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.End, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.PageDown, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.PageUp, CaretChangeEvent);

	SetupWith(self, ENativeEvents.keyup, EKeyCode.KeyA, { bCtrl: true }, CaretChangeEvent);
};

export default Keyboard;