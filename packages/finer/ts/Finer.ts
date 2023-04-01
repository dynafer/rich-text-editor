import Options, { IOptions } from './Options';
import EditorInit, { IEditorInit } from './packages/EditorInit';
import { ENativeEvents, PreventEvent } from './packages/events/EventSetupUtils';
import { EKeyCode } from './packages/events/keyboard/KeyboardUtils';
import PluginLoader, { IPluginLoader } from './packages/loaders/PluginLoader';
import ScriptLoader, { IScriptLoader } from './packages/loaders/ScriptLoader';
import IconManager, { IIconManager } from './packages/managers/IconManager';

declare global {
	const Finer: IFiner;
}

interface IFiner {
	readonly Loaders: {
		readonly Icon: IScriptLoader,
		readonly Plugin: IPluginLoader,
	},
	readonly Icons: IIconManager,
	readonly Options: IOptions,
	readonly NativeEventMap: Record<ENativeEvents, ENativeEvents>,
	readonly KeyCode: Record<EKeyCode, EKeyCode>,
	PreventEvent: EventListener,
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
	KeyCode: EKeyCode,
	PreventEvent: PreventEvent,
	Init: EditorInit,
};

export default Finer;