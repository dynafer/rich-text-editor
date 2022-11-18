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
		new Promise((resolve) => {
			try {
				attached[name](editor);
				resolve();
			} catch (error) {
				console.error(error);
				editor.Notify(ENotificationStatus.WARNING, `Plugin: ${name} runs inappropriately`);
				resolve();
			}
		});

	return {
		...ScriptLoader('Plugin'),
		Add,
		Attach,
	};
};

export default PluginLoader();