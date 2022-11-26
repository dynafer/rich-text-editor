import Editor from '../../Editor';
import { ENativeEvents, Setup } from '../EventSetupUtils';
import BeforeInputEvent from './BeforeInput';

const Update = (editor: Editor) => {
	Setup(editor, ENativeEvents.beforeinput, BeforeInputEvent(editor).GetEvent);
};

export default Update;