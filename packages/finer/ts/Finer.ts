import '../../scss/Finer.scss';
import PluginManager, { IPluginManager } from 'finer/packages/managers/PluginManager';
import { TConfiguration } from 'finer/packages/Configuration';
import Init from 'finer/packages/Init';
import Editor from 'finer/packages/Editor';

declare global {
	const finer: IFiner;
}

interface IFiner {
	Managers: {
		Plugin: IPluginManager
	},
	Init: (config: Record<string, TConfiguration>) => Promise<Editor>
}

const finer: IFiner = {
	Managers: {
		Plugin: PluginManager
	},
	Init: Init,
};

export default finer;