import DOM from '../../dom/DOM';
import Editor from '../../Editor';
import { ENativeEvents } from '../EventSetupUtils';

const Resize = (editor: Editor) => {
	const self = editor;

	DOM.On(window, ENativeEvents.resize, self.Tools.DOM.ChangePositions);
};

export default Resize;