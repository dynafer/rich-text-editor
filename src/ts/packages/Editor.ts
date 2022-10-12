import IConfiguration from './Configuration';
import DOM, { IDom } from './dom/DOM';
import Init from './Init';

interface IEditor {
	dom: IDom,
	Init: (config: IConfiguration) => Promise<unknown>
}

const Editor: IEditor = {
	dom: DOM(),
	Init: Init,
};

export {
	IEditor,
	Editor
};