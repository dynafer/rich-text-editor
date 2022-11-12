import Editor from '../../Editor';
import { CaretChangeEvent, EEventNames, Setup } from '../EventSetupUtils';

const Mouse = (editor: Editor) => {
	Setup(editor, EEventNames.mouseup, CaretChangeEvent);
};

export default Mouse;