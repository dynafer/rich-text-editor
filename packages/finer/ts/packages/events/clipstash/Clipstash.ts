import Editor from '../../Editor';
import { ENativeEvents, Setup } from '../EventSetupUtils';
import Copy from './Copy';

const Clipstash = (editor: Editor) => {
	const self = editor;

	Setup(self, ENativeEvents.copy, Copy);
	Setup(self, ENativeEvents.cut, Copy);
};

export default Clipstash;