import Interlocaliser, { IInterlocaliser } from '@dynafer/interlocaliser';
import Options, { IOptions } from './Options';
import EditorInit, { TEditorInit } from './packages/EditorInit';
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
		readonly Language: IScriptLoader,
		readonly Plugin: IPluginLoader,
	},
	readonly Icons: IIconManager,
	readonly Options: IOptions,
	readonly NativeEventMap: Record<ENativeEvents, ENativeEvents>,
	readonly KeyCode: Record<EKeyCode, EKeyCode>,
	readonly ILC: IInterlocaliser,
	PreventEvent: EventListener,
	Init: TEditorInit,
}

const Finer: IFiner = {
	Loaders: {
		Icon: ScriptLoader('Icon'),
		Language: ScriptLoader('Language'),
		Plugin: PluginLoader,
	},
	Icons: IconManager,
	Options,
	NativeEventMap: ENativeEvents,
	KeyCode: EKeyCode,
	ILC: Interlocaliser,
	PreventEvent,
	Init: EditorInit,
};

export default Finer;