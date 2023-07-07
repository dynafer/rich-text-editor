import Interlocaliser, { IInterlocaliser } from '@dynafer/interlocaliser';
import * as Utils from '@dynafer/utils';
import Options, { IOptions } from './Options';
import EditorInit, { TEditorInit } from './packages/EditorInit';
import { ENativeEvents, PreventEvent } from './packages/events/EventSetupUtils';
import { EKeyCode } from './packages/events/keyboard/KeyboardUtils';
import PluginLoader, { IPluginLoader } from './packages/loaders/PluginLoader';
import ScriptLoader, { IScriptLoader } from './packages/loaders/ScriptLoader';
import IconManager, { IIconManager } from './packages/managers/IconManager';

declare global {
	const RichEditor: IRichEditor;
}

export interface IRichEditor {
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
	readonly Utils: {
		Arr: typeof Utils.Arr,
		Formula: typeof Utils.Formula,
		Obj: typeof Utils.Obj,
		Str: typeof Utils.Str,
		Type: typeof Utils.Type,
		UID: typeof Utils.UID,
	},
	PreventEvent: EventListener,
	Init: TEditorInit,
}

const RichEditor: IRichEditor = {
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
	Utils,
	PreventEvent,
	Init: EditorInit,
};

export default RichEditor;