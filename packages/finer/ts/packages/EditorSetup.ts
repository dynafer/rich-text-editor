import { Type } from '@dynafer/utils';
import Editor from './Editor';
import DOM from './dom/DOM';
import EditorUtils from './editorUtils/EditorUtils';
import EventSetup from './events/EventSetup';
import PluginLoader from './loaders/PluginLoader';
import { ENotificationStatus } from './managers/NotificationManager';
import Options from '../Options';

const AttachPlugin = (editor: Editor): Promise<void> => {
	const self = editor;

	return new Promise((resolve, reject) => {
		const attachPlugins: Promise<void>[] = [];
		for (const name of self.Config.Plugins) {
			if (!PluginLoader.Has(name)) {
				self.Notify(ENotificationStatus.warning, `Plugin '${name}' hasn't loaded.`);
				continue;
			}
	
			attachPlugins.push(finer.Managers.Plugin.Attach(self, name));
		}
	
		DOM.Hide(self.Config.Selector);
	
		Promise.all(attachPlugins)
			.then(() => {
				if (Type.IsInstance(self.Config.Selector, HTMLTextAreaElement)) {
					self.SetContent(self.Config.Selector.value);
					self.Config.Selector.value = '';
				} else {
					self.SetContent(self.Config.Selector.innerHTML);
					self.Config.Selector.innerHTML = '';
				}
	
				return resolve();
			}).then(() => {
				const events = self.Utils.Event.Get();
				for (const [key, eventList] of Object.entries(events)) {
					if (!DOM.Utils.NativeEvents.includes(key)) continue;
					self.DOM.On(self.GetBody(), key, (evt) => {
						for (const event of eventList) {
							event(evt);
						}
					});
				}
			})
			.catch(error => {
				self.Notify(ENotificationStatus.error, error);
				reject(error);
			});
	});
};

const EditorSetup = (editor: Editor): Promise<void> => {
	const self = editor;
	return new Promise((resolve, reject) => {
		if (self.IsIFrame()) {
			self.DOM = DOM.New(
				(self.Frame.Container as HTMLIFrameElement).contentWindow as Window & typeof globalThis,
				(self.Frame.Container as HTMLIFrameElement).contentDocument as Document
			);

			self.DOM.Insert(self.DOM.Doc.head, DOM.Create('link', {
				attrs: {
					rel: 'stylesheet',
					href: Options.JoinUrl('css', 'skins/simple/skin')
				}
			}));

			self.DOM.SetAttrs(self.GetBody(), {
				id: DOM.Utils.CreateUEID('editor-body', false),
				contenteditable: 'true'
			});
		}

		self.Utils = EditorUtils(self);
		EventSetup(self);

		PluginLoader.LoadParallel(self.Config.Plugins)
			.then(() => AttachPlugin(self))
			.then(() => resolve())
			.catch(error => reject(error));
	});
};

export default EditorSetup;