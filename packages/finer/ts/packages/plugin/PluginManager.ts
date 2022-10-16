import Editor from 'finer/packages/Editor';

type TPlugin = (editor: Editor) => void;

export interface IPluginManager {
	Loaded: Record<string, TPlugin>,
	Add: (name: string, plugin: TPlugin) => void,
	Load: (editor: Editor, name: string) => Promise<void | string>,
}

const PluginManager = (): IPluginManager => {
	const Loaded: Record<string, TPlugin> = {};

	const Add = (name: string, plugin: TPlugin) => {
		if (Loaded[name]) return;
		Loaded[name] = plugin;
	};

	const Load = (editor: Editor, name: string): Promise<void | string> => {
		return new Promise((resolve, reject) => {
			try {
				Loaded[name](editor);
				resolve();
			} catch {
				reject(`Plugin: ${name} runs inappropriately`);
			}
		});
	};

	return {
		Loaded,
		Add,
		Load,
	};
};

export default PluginManager();