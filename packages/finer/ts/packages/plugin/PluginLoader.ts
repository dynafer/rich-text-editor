import { Utils } from 'dynafer/utils';
import DOM from 'finer/packages/dom/DOM';

export interface IPluginLoader {
	Loaded: string[],
	Load: (name: string) => Promise<void | string>,
	Has: (name: string) => boolean,
	LoadParallel: (plugins: string[]) => Promise<void | string>,
}

const PluginLoader = (): IPluginLoader => {
	const Loaded: string[] = [];

	const Has = (name: string) => Loaded.includes(name);

	const Load = (name: string): Promise<void | string> => {
		return new Promise((resolve, reject) => {
			if (Has(name)) return reject(`Plugin: ${name} is already loaded`);

			const script = DOM.Create('script', {
				attrs: {
					src: Utils.JoinPluginUrl(name)
				}
			});

			script.onload = () => {
				Loaded.push(name);
				script.remove();
				resolve();
			};

			script.onerror = () => {
				reject(`Plugin: ${name} is failed to load scripts`);
			};

			DOM.Insert(DOM.Doc.head, script);
		});
	};

	const LoadParallel = (plugins: string[]): Promise<void | string> => {
		return new Promise((resolve, reject) => {
			const load: Promise<void | string>[] = [];
			for (const plugin of plugins) {
				load.push(Load(plugin));
			}

			Promise.all(load)
				.then(() => resolve())
				.catch(error => reject(error));
		});
	};

	return {
		Loaded,
		Has,
		Load,
		LoadParallel,
	};
};

export default PluginLoader();