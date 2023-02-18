import DOM from '../../dom/DOM';
import Editor from '../../Editor';
import { ENativeEvents } from '../EventSetupUtils';

const Resize = (editor: Editor) => {
	const self = editor;
	const TableTools = self.Tools.DOM.Table;

	DOM.On(DOM.Win, ENativeEvents.resize, () => {
		TableTools.ChangePositions();
	});
};

export default Resize;