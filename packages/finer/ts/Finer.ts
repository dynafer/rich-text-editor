import PluginManager, { IPluginManager } from './packages/managers/PluginManager';
import Editor, { IEditorConstructor } from './packages/Editor';

declare global {
	const finer: IFiner;
}

interface IFiner {
	Managers: {
		Plugin: IPluginManager
	},
	Editor: IEditorConstructor
}

const finer: IFiner = {
	Managers: {
		Plugin: PluginManager
	},
	Editor: Editor,
};

export default finer;