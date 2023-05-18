import Editor from '../../Editor';
import { ENativeEvents, Setup } from '../EventSetupUtils';
import Backspace from './Backspace';
import DefaultEvent from './Default';
import DeleteInTableCells from './DeleteInTableCells';
import Enter from './Enter';
import { EKeyCode, SetupKeyboard, SetupWith } from './KeyboardUtils';
import MoveCaret from './MoveCaret';
import SelectAll from './SelectAll';

const Keyboard = (editor: Editor) => {
	const self = editor;
	const caretChangeEvent = () => self.Utils.Shared.DispatchCaretChange();
	const deleteEvent = () => {
		self.DOM.EventUtils.FindAndUnbindDetached()
			.catch(console.error);
	};


	Setup(self, ENativeEvents.keyup, DefaultEvent);
	Setup(self, ENativeEvents.keypress, DefaultEvent);
	Setup(self, ENativeEvents.keydown, DefaultEvent);
	Setup(self, ENativeEvents.keydown, DeleteInTableCells);

	Setup(self, ENativeEvents.keydown, MoveCaret);

	SetupKeyboard(self, ENativeEvents.keydown, EKeyCode.Enter, Enter);

	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.Backspace, deleteEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.Delete, deleteEvent);

	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowUp, caretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowDown, caretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowLeft, caretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.ArrowRight, caretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.Home, caretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.End, caretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.PageDown, caretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.PageUp, caretChangeEvent);
	SetupKeyboard(self, ENativeEvents.keyup, EKeyCode.Enter, caretChangeEvent);

	SetupKeyboard(self, ENativeEvents.keydown, EKeyCode.Backspace, Backspace);

	SetupWith(self, ENativeEvents.keyup, EKeyCode.KeyA, { bCtrl: true }, SelectAll);
};

export default Keyboard;