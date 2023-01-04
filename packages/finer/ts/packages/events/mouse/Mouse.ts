import Editor from '../../Editor';
import { CaretChangeEvent, ENativeEvents, Setup } from '../EventSetupUtils';
import SelectTable from './SelectTable';

const Mouse = (editor: Editor) => {
	Setup(editor, ENativeEvents.mouseup, CaretChangeEvent);
	Setup(editor, ENativeEvents.mousedown, SelectTable);
};

export default Mouse;