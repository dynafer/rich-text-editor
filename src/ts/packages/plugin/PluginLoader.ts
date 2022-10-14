import { JoinPluginUrl } from 'finer/packages/utils/Option';
import DOM from '../dom/DOM';

export interface IPluginLoader {
	Loaded: string[],
	Load: (name: string) => Promise<void | string>,
	LoadParallel: (plugins: string[]) => Promise<void | string>,
}

const PluginLoader = (): IPluginLoader => {
	const Loaded: string[] = [];

	const Load = (name: string): Promise<void | string> => {
		return new Promise((resolve, reject) => {
			if (Loaded.includes(name)) return reject(`Plugin: ${name} is already loaded`);

			const script = DOM.Create('script', {
				attrs: {
					src: JoinPluginUrl(name)
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
		Load,
		LoadParallel,
	};
};

export default PluginLoader();