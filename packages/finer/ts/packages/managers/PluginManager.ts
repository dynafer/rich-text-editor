import { Type } from '@dynafer/utils';
import Editor from '../Editor';
import { ENotificationStatus } from './NotificationManager';

const loaded: Record<string, TPlugin> = {};

type TPlugin = (editor: Editor) => void;

export interface IPluginManager {
	Add: (name: string, plugin: TPlugin) => void,
	Attach: (editor: Editor, name: string) => Promise<void>,
}

const PluginManager = (): IPluginManager => {
	const Add = (name: string, plugin: TPlugin) => {
		if (Type.IsFunction(loaded[name])) return;
		loaded[name] = plugin;
	};

	const Attach = (editor: Editor, name: string): Promise<void> => {
		return new Promise((resolve) => {
			try {
				loaded[name](editor);
				resolve();
			} catch {
				editor.Notify(ENotificationStatus.warning, `Plugin: ${name} runs inappropriately`);
				resolve();
			}
		});
	};

	return {
		Add,
		Attach,
	};
};

export default PluginManager();