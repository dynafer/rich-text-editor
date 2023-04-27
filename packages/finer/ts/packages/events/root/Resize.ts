import DOM from '../../dom/DOM';
import Editor from '../../Editor';
import { ENativeEvents } from '../EventSetupUtils';

const Resize = (editor: Editor) => {
	const self = editor;

	DOM.On(window, ENativeEvents.resize, self.Tools.Parts.ChangePositions);
};

export default Resize;