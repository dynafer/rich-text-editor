import Editor from 'finer/packages/Editor';
import { ENotificationStatus } from 'finer/packages/managers/NotificationManager';

const loaded: Record<string, TPlugin> = {};

type TPlugin = (editor: Editor) => void;

export interface IPluginManager {
	Add: (name: string, plugin: TPlugin) => void,
	Attach: (editor: Editor, name: string) => Promise<void | string>,
}

const PluginManager = (): IPluginManager => {
	const Add = (name: string, plugin: TPlugin) => {
		if (loaded[name]) return;
		loaded[name] = plugin;
	};

	const Attach = (editor: Editor, name: string): Promise<void | string> => {
		return new Promise((resolve) => {
			try {
				loaded[name](editor);
				resolve();
			} catch {
				editor.Dispatch(ENotificationStatus.warning, `Plugin: ${name} runs inappropriately`);
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