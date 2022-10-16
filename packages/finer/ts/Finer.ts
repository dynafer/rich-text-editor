import '../../scss/Finer.scss';
import DOM, { IDom } from 'finer/packages/dom/DOM';
import PluginManager, { IPluginManager } from 'finer/packages/plugin/PluginManager';
import { TConfiguration } from 'finer/packages/Configuration';
import Init from 'finer/packages/Init';
import Editor from 'finer/packages/Editor';
import PluginLoader, { IPluginLoader } from 'finer/packages/plugin/PluginLoader';

interface IFiner {
	dom: IDom,
	loaders: {
		plugin: IPluginLoader
	}
	managers: {
		plugin: IPluginManager
	},
	Init: (config: Record<string, TConfiguration>) => Promise<Editor>
}

declare global {
	const finer: IFiner;
}

const finer: IFiner = {
	dom: DOM,
	loaders: {
		plugin: PluginLoader
	},
	managers: {
		plugin: PluginManager
	},
	Init: Init,
};

export default finer;