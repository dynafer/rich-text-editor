import { Arr, Str } from '@dynafer/utils';
import Editor from '../Editor';
import { IEvent } from '../editorUtils/EventUtils';
import { ENotificationStatus } from './NotificationManager';

export interface IPluginManager {
	AttachPlugin: () => Promise<void>
}

const PluginManager = (editor: Editor): IPluginManager => {
	const self = editor;
	const DOM = self.DOM;

	self.On('caret:change', ((paths: EventTarget[]) => {
		const caretPointers = DOM.SelectAll('[caret]');
		if (Arr.IsEmpty(caretPointers)) return;

		const currentCarets: Node[] = [];
		for (const path of paths) {
			if (DOM.HasAttr(path as Node, 'caret')) currentCarets.push(path as Node);
		}

		for (const caretPointer of caretPointers) {
			if (currentCarets.includes(caretPointer)) continue;

			if (Str.IsEmpty(DOM.GetInnerText(caretPointer))) {
				const parents = DOM.GetParents(caretPointer, true);
				for (const parent of parents) {
					if (Str.IsEmpty(DOM.GetInnerText(parent as HTMLElement))) {
						(parent as HTMLElement).remove();
						continue;
					}

					break;
				}
			} else {
				caretPointer.replaceWith(caretPointer.children[0]);
			}
		}
	}) as IEvent);

	const AttachPlugin = (): Promise<void> => {
		return new Promise((resolve, reject) => {
			const attachPlugins: Promise<void>[] = [];
			for (const name of self.Config.Plugins) {
				if (!finer.Loaders.Plugin.Has(name)) {
					self.Notify(ENotificationStatus.warning, `Plugin '${name}' hasn't loaded.`);
					continue;
				}

				attachPlugins.push(finer.Loaders.Plugin.Attach(self, name));
			}

			Promise.all(attachPlugins)
				.catch(error => {
					self.Notify(ENotificationStatus.error, error as string);
					reject(error);
				})
				.finally(() => {
					const events = self.Utils.Event.Get();
					for (const [key, eventList] of Object.entries(events)) {
						if (!DOM.Utils.NativeEvents.includes(key)) continue;
						DOM.On(self.IsIFrame() ? DOM.Select('html') : self.GetBody(), key, (evt) => {
							for (const event of eventList) {
								event(evt);
							}
						});
					}

					resolve();
				});
		});
	};

	return {
		AttachPlugin
	};
};

export default PluginManager;