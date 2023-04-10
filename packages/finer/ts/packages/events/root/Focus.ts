import DOM from '../../dom/DOM';
import Editor from '../../Editor';
import { ENativeEvents } from '../EventSetupUtils';

const Focus = (editor: Editor) => {
	const self = editor;

	self.On(ENativeEvents.focusin, () => DOM.AddClass(self.Frame.Container, 'focused'));
	self.On(ENativeEvents.focusout, () => DOM.RemoveClass(self.Frame.Container, 'focused'));
};

export default Focus;