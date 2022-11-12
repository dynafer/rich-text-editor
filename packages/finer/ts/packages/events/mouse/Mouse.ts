import Editor from '../../Editor';
import { CaretChangeEvent, ENativeEvents, Setup } from '../EventSetupUtils';

const Mouse = (editor: Editor) => {
	Setup(editor, ENativeEvents.mouseup, CaretChangeEvent);
};

export default Mouse;