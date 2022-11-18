import EditorInit, { IEditorInit } from './packages/EditorInit';
import PluginLoader, { IPluginLoader } from './packages/loaders/PluginLoader';
import ScriptLoader, { IScriptLoader } from './packages/loaders/ScriptLoader';
import IconManager, { IIconManager } from './packages/managers/IconManager';

declare global {
	const Finer: IFiner;
}

interface IFiner {
	Loaders: {
		Icon: IScriptLoader,
		Plugin: IPluginLoader,
	},
	Init: IEditorInit,
	Icons: IIconManager,
}

const Finer: IFiner = {
	Loaders: {
		Icon: ScriptLoader('Icon'),
		Plugin: PluginLoader,
	},
	Icons: IconManager,
	Init: EditorInit,
};

export default Finer;