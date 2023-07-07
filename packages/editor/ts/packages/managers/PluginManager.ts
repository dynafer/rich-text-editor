import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../Editor';
import { ENotificationStatus } from './NotificationManager';

export interface IPluginManager {
	Has: (name: string) => boolean,
	Add: (name: string, plugin: <T>(...args: T[]) => void) => void,
	Get: (name: string) => (<T>(...args: T[]) => void) | undefined,
	AttachPlugin: () => Promise<void>,
}

const PluginManager = (editor: Editor): IPluginManager => {
	const self = editor;

	const plugins: Record<string, (<T>(...args: T[]) => void)> = {};

	const Has = (name: string): boolean => Type.IsFunction(plugins[Str.LowerCase(name)]);
	const Add = (name: string, plugin: <T>(...args: T[]) => void) => {
		if (Has(name)) return;
		plugins[Str.LowerCase(name)] = plugin;
	};
	const Get = (name: string): (<T>(...args: T[]) => void) | undefined => {
		const plugin = plugins[Str.LowerCase(name)];
		if (Type.IsFunction(plugin)) return plugin;
		self.Notify(ENotificationStatus.WARNING, `Plugin '${name}' hasn't loaded yet.`);
		return undefined;
	};

	const AttachPlugin = (): Promise<void> =>
		new Promise((resolve, reject) => {
			const attachPlugins: Promise<void>[] = [];
			Arr.Each(self.Config.Plugins, name => {
				if (!RichEditor.Loaders.Plugin.Has(name))
					return self.Notify(ENotificationStatus.WARNING, `Plugin '${name}' hasn't loaded yet.`);

				Arr.Push(attachPlugins, RichEditor.Loaders.Plugin.Attach(self, name));
			});

			Promise.all(attachPlugins)
				.catch(error => reject(error))
				.finally(resolve);
		});

	return {
		Has,
		Add,
		Get,
		AttachPlugin,
	};
};

export default PluginManager;