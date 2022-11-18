import Options from '../../Options';
import DOM from '../dom/DOM';

export interface IScriptLoader {
	Has: (name: string) => boolean,
	Load: (name: string) => Promise<void>,
	LoadParallel: (plugins: string[]) => Promise<void>,
}

const ScriptLoader = (loaderName: string): IScriptLoader => {
	const loaded: string[] = [];

	const Has = (name: string) => loaded.includes(name);

	const Load = (name: string): Promise<void> =>
		new Promise((resolve, reject) => {
			if (Has(name)) return resolve();

			const script = DOM.Create('script', {
				attrs: {
					src: Options.JoinUrl(loaderName.toLowerCase(), name)
				}
			});

			script.onload = () => {
				if (!loaded.includes(name)) loaded.push(name);
				DOM.Remove(script);
				resolve();
			};

			script.onerror = () => {
				reject(`${loaderName}: ${name} is failed to load scripts`);
			};

			DOM.Insert(DOM.Doc.head, script);
		});

	const LoadParallel = (names: string[]): Promise<void> =>
		new Promise((resolve, reject) => {
			const load: Promise<void>[] = [];
			for (const name of names) {
				load.push(Load(name));
			}

			Promise.all(load)
				.catch(error => reject(error))
				.finally(() => resolve());
		});

	return {
		Has,
		Load,
		LoadParallel,
	};
};

export default ScriptLoader;