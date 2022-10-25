import Options from '../../Options';
import DOM from '../dom/DOM';

const loaded: string[] = [];

export interface IPluginLoader {
	Load: (name: string) => Promise<void>,
	Has: (name: string) => boolean,
	LoadParallel: (plugins: string[]) => Promise<void>,
}

const PluginLoader = (): IPluginLoader => {
	const Has = (name: string) => loaded.includes(name);

	const Load = (name: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			if (Has(name)) return resolve();

			const script = DOM.Create('script', {
				attrs: {
					src: Options.JoinUrl('plugin', name)
				}
			});

			script.onload = () => {
				if (!loaded.includes(name)) loaded.push(name);
				script.remove();
				resolve();
			};

			script.onerror = () => {
				reject(`Plugin: ${name} is failed to load scripts`);
			};

			DOM.Insert(DOM.Doc.head, script);
		});
	};

	const LoadParallel = (plugins: string[]): Promise<void> => {
		return new Promise((resolve, reject) => {
			const load: Promise<void>[] = [];
			for (const plugin of plugins) {
				load.push(Load(plugin));
			}

			Promise.all(load)
				.then(() => resolve())
				.catch(error => reject(error));
		});
	};

	return {
		Has,
		Load,
		LoadParallel,
	};
};

export default PluginLoader();