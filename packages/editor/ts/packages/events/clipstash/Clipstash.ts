import Editor from '../../Editor';
import { ENativeEvents, Setup } from '../EventSetupUtils';
import Copy from './Copy';
import Paste from './Paste';

const Clipstash = (editor: Editor) => {
	const self = editor;

	Setup(self, ENativeEvents.copy, Copy);
	Setup(self, ENativeEvents.cut, Copy);
	Setup(self, ENativeEvents.paste, Paste);
};

export default Clipstash;