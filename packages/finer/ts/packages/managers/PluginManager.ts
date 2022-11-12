import { Arr, Str } from '@dynafer/utils';
import Editor from '../Editor';
import { IEvent } from '../editorUtils/EventUtils';
import { ENativeEvents } from '../events/EventSetupUtils';
import { ENotificationStatus } from './NotificationManager';

export interface IPluginManager {
	AttachPlugin: () => Promise<void>
}

const PluginManager = (editor: Editor): IPluginManager => {
	const self = editor;
	const DOM = self.DOM;

	self.On('caret:change', ((paths: Node[]) => {
		const caretPointers = DOM.SelectAll('[caret]');
		if (Arr.IsEmpty(caretPointers)) return;

		const currentCarets: Node[] = [];
		for (const path of paths) {
			if (DOM.HasAttr(path, 'caret')) currentCarets.push(path);
		}

		for (const caretPointer of caretPointers) {
			if (currentCarets.includes(caretPointer)) continue;

			if (!Str.IsEmpty(DOM.GetText(caretPointer))) {
				DOM.SetOuterHTML(caretPointer, DOM.GetHTML(caretPointer));
				continue;
			}

			const parents = DOM.GetParents(caretPointer, true);
			for (const parent of parents) {
				if (Str.IsEmpty(DOM.GetText(parent as HTMLElement))) {
					DOM.Remove(parent as Element, true);
					continue;
				}

				break;
			}
		}
	}) as IEvent);

	const AttachPlugin = (): Promise<void> =>
		new Promise((resolve, reject) => {
			const attachPlugins: Promise<void>[] = [];
			for (const name of self.Config.Plugins) {
				if (!finer.Loaders.Plugin.Has(name)) {
					self.Notify(ENotificationStatus.WARNING, `Plugin '${name}' hasn't loaded.`);
					continue;
				}

				attachPlugins.push(finer.Loaders.Plugin.Attach(self, name));
			}

			Promise.all(attachPlugins)
				.catch(error => {
					self.Notify(ENotificationStatus.ERROR, error as string);
					reject(error);
				})
				.finally(() => {
					const events = self.Utils.Event.Get();
					for (const [key, eventList] of Object.entries(events)) {
						if (!ENativeEvents[key]) continue;
						DOM.On(self.IsIFrame() ? DOM.GetRoot() : self.GetBody(), key, (evt) => {
							for (const event of eventList) {
								event(evt);
							}
						});
					}

					resolve();
				});
		});

	return {
		AttachPlugin
	};
};

export default PluginManager;