import Options, { IOptions } from './Options';
import EditorInit, { IEditorInit } from './packages/EditorInit';
import { ENativeEvents, PreventEvent } from './packages/events/EventSetupUtils';
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
	Options: IOptions,
	NativeEventMap: Record<ENativeEvents, ENativeEvents>,
	PreventEvent: (event: Event) => void,
	Init: IEditorInit,
}

const Finer: IFiner = {
	Loaders: {
		Icon: ScriptLoader('Icon'),
		Plugin: PluginLoader,
	},
	Icons: IconManager,
	Options,
	NativeEventMap: ENativeEvents,
	PreventEvent: PreventEvent,
	Init: EditorInit,
};

export default Finer;