import { Arr, Obj, Str } from '@dynafer/utils';
import Editor from '../Editor';
import { ENativeEvents } from '../events/EventSetupUtils';
import { ENotificationStatus } from './NotificationManager';

export interface IPluginManager {
	Has: (name: string) => boolean,
	Add: (name: string, plugin: <T>(...args: T[]) => void) => void,
	Get: (name: string) => (<T>(...args: T[]) => void),
	AttachPlugin: () => Promise<void>,
}

const PluginManager = (editor: Editor): IPluginManager => {
	const self = editor;
	const DOM = self.DOM;

	const plugins: Record<string, (<T>(...args: T[]) => void)> = {};

	const Has = (name: string): boolean => !!plugins[Str.LowerCase(name)];
	const Add = (name: string, plugin: <T>(...args: T[]) => void) => {
		if (Has(name)) return;
		plugins[Str.LowerCase(name)] = plugin;
	};
	const Get = (name: string): (<T>(...args: T[]) => void) => plugins[Str.LowerCase(name)];

	const AttachPlugin = (): Promise<void> =>
		new Promise((resolve, reject) => {
			const attachPlugins: Promise<void>[] = [];
			Arr.Each(self.Config.Plugins, name => {
				if (!Finer.Loaders.Plugin.Has(name))
					return self.Notify(ENotificationStatus.WARNING, `Plugin '${name}' hasn't loaded.`);

				Arr.Push(attachPlugins, Finer.Loaders.Plugin.Attach(self, name));
			});

			Promise.all(attachPlugins)
				.catch(error => {
					self.Notify(ENotificationStatus.ERROR, error as string);
					reject(error);
				})
				.finally(() => {
					const events = self.Utils.Event.Get();
					Obj.Entries(events, (key, eventList) => {
						if (!ENativeEvents[key as ENativeEvents]) return;
						DOM.On(self.IsIFrame() ? DOM.GetRoot() : self.GetBody(), key, (evt) =>
							Arr.Each(eventList, event => event(evt))
						);
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