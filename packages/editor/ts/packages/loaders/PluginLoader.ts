import { Type } from '@dynafer/utils';
import Editor from '../Editor';
import { ENotificationStatus } from '../managers/NotificationManager';
import ScriptLoader from './ScriptLoader';

type TPlugin = (editor: Editor) => void;

export interface IPluginLoader {
	Has: (name: string) => boolean,
	Load: (name: string) => Promise<void>,
	LoadParallel: (plugins: string[]) => Promise<void>,
	Add: (name: string, plugin: TPlugin) => void,
	Attach: (editor: Editor, name: string) => Promise<void>,
}

const PluginLoader = (): IPluginLoader => {
	const attached: Record<string, TPlugin> = {};

	const Add = (name: string, plugin: TPlugin) => {
		if (Type.IsFunction(attached[name])) return;
		attached[name] = plugin;
	};

	const Attach = (editor: Editor, name: string): Promise<void> =>
		new Promise(resolve => {
			try {
				resolve(attached[name](editor));
			} catch (error) {
				console.error(error);
				resolve(editor.Notify(ENotificationStatus.ERROR, `Plugin: ${name} runs inappropriately.`));
			}
		});

	return {
		...ScriptLoader('Plugin'),
		Add,
		Attach,
	};
};

export default PluginLoader();