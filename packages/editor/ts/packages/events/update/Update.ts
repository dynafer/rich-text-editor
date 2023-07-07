import Editor from '../../Editor';
import { ENativeEvents, Setup } from '../EventSetupUtils';
import Input from './Input';

const Update = (editor: Editor) => {
	const self = editor;
	const input = Input(self);

	Setup(self, ENativeEvents.beforeinput, input.GetBefore);
	Setup(self, ENativeEvents.input, input.Get);
};

export default Update;