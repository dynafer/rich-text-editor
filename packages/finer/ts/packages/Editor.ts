import { TConfiguration } from 'finer/packages/Configuration';
import Init from 'finer/packages/Init';
import DOM, { IDom } from 'finer/packages/dom/DOM';
import PluginManager, { IPluginManager } from 'finer/packages/plugin/PluginManager';

interface IEditor {
	dom: IDom,
	managers: {
		plugin: IPluginManager
	},
	Init: (config: Record<string, TConfiguration>) => Promise<unknown>
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