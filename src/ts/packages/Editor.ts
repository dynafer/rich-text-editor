import { TConfiguration } from './Configuration';
import DOM, { IDom } from 'finer/packages/dom/DOM';
import Init from './Init';
import PluginManager, { IPluginManager } from 'finer/packages/plugin/PluginManager';

interface IEditor {
	dom: IDom,
	managers: {
		plugin: IPluginManager
	},
	Init: (config: IMap<TConfiguration>) => Promise<unknown>
}

const Editor: IEditor = {
	dom: DOM,
	managers: {
		plugin: PluginManager
	},
	Init: Init,
};

export {
	IEditor,
	Editor
};