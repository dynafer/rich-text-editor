type TPlugin = () => void;

export interface IPluginManager {
	Loaded: IMap<TPlugin>,
	Add: (name: string, plugin: TPlugin) => void,
	Load: (name: string) => Promise<void | string>,
	LoadAll: () => Promise<void | string>,
}

const PluginManager = (): IPluginManager => {
	const Loaded: IMap<TPlugin> = {};

	const Add = (name: string, plugin: TPlugin) => {
		if (Loaded[name]) return;
		Loaded[name] = plugin;
	};

	const Load = (name: string): Promise<void | string> => {
		return new Promise((resolve, reject) => {
			try {
				Loaded[name]();
				resolve();
			} catch {
				reject(`Plugin: ${name} runs inappropriately`);
			}
		});
	};

	const LoadAll = (): Promise<void | string> => {
		return new Promise((resolve, reject) => {
			const load: Promise<void | string>[] = [];
			for (const name of Object.keys(Loaded)) {
				load.push(Load(name));
			}

			Promise.all(load)
				.then(() => resolve())
				.catch(error => reject(error));
		});
	};

	return {
		Loaded,
		Add,
		Load,
		LoadAll,
	};
};

export default PluginManager();