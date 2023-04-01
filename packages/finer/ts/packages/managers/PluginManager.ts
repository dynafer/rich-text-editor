import { Arr, Obj, Str, Type } from '@dynafer/utils';
import Editor from '../Editor';
import { ENativeEvents } from '../events/EventSetupUtils';
import { ENotificationStatus } from './NotificationManager';

export interface IPluginManager {
	Has: (name: string) => boolean,
	Add: (name: string, plugin: <T>(...args: T[]) => void) => void,
	Get: (name: string) => (<T>(...args: T[]) => void) | undefined,
	AttachPlugin: () => Promise<void>,
}

const PluginManager = (editor: Editor): IPluginManager => {
	const self = editor;
	const DOM = self.DOM;

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
				if (!Finer.Loaders.Plugin.Has(name))
					return self.Notify(ENotificationStatus.WARNING, `Plugin '${name}' hasn't loaded yet.`);

				Arr.Push(attachPlugins, Finer.Loaders.Plugin.Attach(self, name));
			});

			Promise.all(attachPlugins)
				.catch(error => reject(error))
				.finally(() => {
					const events = self.Utils.Event.Get();
					Obj.Entries(events, (key, eventList) => {
						if (!ENativeEvents[key as ENativeEvents]) return;
						const body = self.IsIFrame() ? DOM.GetRoot() : self.GetBody();
						DOM.On(body, key, evt => Arr.Each(eventList, event => event(evt)));
					});
					resolve();
				});
		});

	return {
		Has,
		Add,
		Get,
		AttachPlugin,
	};
};

export default PluginManager;