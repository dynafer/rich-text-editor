import PluginLoader, { IPluginLoader } from './packages/loaders/PluginLoader';
import Editor, { IEditorConstructor } from './packages/Editor';

declare global {
	const finer: IFiner;
}

interface IFiner {
	Loaders: {
		Plugin: IPluginLoader,
	},
	Editor: IEditorConstructor,
}

const finer: IFiner = {
	Loaders: {
		Plugin: PluginLoader
	},
	Editor: Editor,
};

export default finer;