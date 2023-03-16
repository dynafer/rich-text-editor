import EditorInit, { IEditorInit } from './packages/EditorInit';
import { ENativeEvents } from './packages/events/EventSetupUtils';
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
	Icons: IIconManager,
	NativeEventMap: Record<ENativeEvents, ENativeEvents>,
	Init: IEditorInit,
}

const Finer: IFiner = {
	Loaders: {
		Icon: ScriptLoader('Icon'),
		Plugin: PluginLoader,
	},
	Icons: IconManager,
	NativeEventMap: ENativeEvents,
	Init: EditorInit,
};

export default Finer;