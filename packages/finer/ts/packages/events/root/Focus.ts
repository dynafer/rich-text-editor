import DOM from '../../dom/DOM';
import Editor from '../../Editor';
import { ENativeEvents } from '../EventSetupUtils';

const Focus = (editor: Editor) => {
	const self = editor;

	const toggleActive = (bActive: boolean) =>
		() => {
			const toggle = bActive ? DOM.AddClass : DOM.RemoveClass;
			toggle(self.Frame.Container, 'focused');
		};

	self.On(ENativeEvents.focus, toggleActive(true));
	self.On(ENativeEvents.focusin, toggleActive(true));
	self.On(ENativeEvents.focusout, toggleActive(false));
	DOM.On(window, ENativeEvents.focusout, toggleActive(false));
};

export default Focus;