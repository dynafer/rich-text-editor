import { Arr, Str } from '@dynafer/utils';
import Options from '../../Options';
import DOM from '../dom/DOM';

export interface IScriptLoader {
	Has: (name: string) => boolean,
	Load: (name: string) => Promise<void>,
	LoadParallel: (plugins: string[]) => Promise<void>,
}

const ScriptLoader = (loaderName: string): IScriptLoader => {
	const loaded: string[] = [];

	const Has = (name: string): boolean => Arr.Contains(loaded, name);

	const Load = (name: string): Promise<void> =>
		new Promise((resolve, reject) => {
			if (Has(name)) return resolve();

			const script = DOM.Create('script', {
				attrs: {
					src: Options.JoinURL(Str.LowerCase(loaderName), name)
				}
			});

			script.onload = () => {
				if (!Has(name)) Arr.Push(loaded, name);
				resolve(DOM.Remove(script));
			};

			script.onerror = () => reject(`${loaderName}: ${name} is failed to load scripts.`);

			DOM.Insert(DOM.Doc.head, script);
		});

	const LoadParallel = (names: string[]): Promise<void> =>
		new Promise((resolve, reject) => {
			const load: Promise<void>[] = [];
			Arr.Each(names, name => Arr.Push(load, Load(name)));

			Promise.all(load)
				.catch(reject)
				.finally(resolve);
		});

	return {
		Has,
		Load,
		LoadParallel,
	};
};

export default ScriptLoader;