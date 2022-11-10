import { Type } from '@dynafer/utils';
import Options from '../../Options';
import Editor from '../Editor';
import DOM from '../dom/DOM';
import { ENotificationStatus } from '../managers/NotificationManager';

const loaded: string[] = [];
const attached: Record<string, TPlugin> = {};

type TPlugin = (editor: Editor) => void;

export interface IPluginLoader {
	Has: (name: string) => boolean,
	Load: (name: string) => Promise<void>,
	LoadParallel: (plugins: string[]) => Promise<void>,
	Add: (name: string, plugin: TPlugin) => void,
	Attach: (editor: Editor, name: string) => Promise<void>,
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
				.catch(error => reject(error))
				.finally(() => resolve());
		});
	};

	const Add = (name: string, plugin: TPlugin) => {
		if (Type.IsFunction(attached[name])) return;
		attached[name] = plugin;
	};

	const Attach = (editor: Editor, name: string): Promise<void> => {
		const self = editor;

		return new Promise((resolve) => {
			try {
				attached[name](self);
				resolve();
			} catch (error) {
				console.error(error);
				self.Notify(ENotificationStatus.WARNING, `Plugin: ${name} runs inappropriately`);
				resolve();
			}
		});
	};

	return {
		Has,
		Load,
		LoadParallel,
		Add,
		Attach,
	};
};

export default PluginLoader();