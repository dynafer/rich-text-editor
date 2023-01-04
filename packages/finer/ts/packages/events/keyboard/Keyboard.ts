import Editor from '../../Editor';
import { CaretChangeEvent, ENativeEvents, Setup } from '../EventSetupUtils';
import Backspace from './Backspace';
import DefaultEvent from './Default';
import InTable from './InTable';
import { EKeyCode, SetupWith, SetupKeyboard } from './KeyboardUtils';

const Keyboard = (editor: Editor) => {
	const self = editor;

	Setup(self, ENativeEvents.keyup, DefaultEvent);
	Setup(self, ENativeEvents.keypress, DefaultEvent);
	Setup(self, ENativeEvents.keydown, DefaultEvent);

	Setup(self, ENativeEvents.keydown, InTable);

	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowUp, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowDown, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowLeft, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowRight, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.Home, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.End, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.PageDown, CaretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.PageUp, CaretChangeEvent);

	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.Backspace, Backspace);

	SetupWith(self, ENativeEvents.keyup, EKeyCode.KeyA, { bCtrl: true }, CaretChangeEvent);
};

export default Keyboard;