import { Type } from 'dynafer/utils';
import Editor from 'finer/packages/Editor';
import DOM from 'finer/packages/dom/DOM';
import PluginLoader from 'finer/packages/loaders/PluginLoader';
import EditorUtils from 'finer/packages/editorUtils/EditorUtils';
import { ENotificationStatus } from 'finer/packages/managers/NotificationManager';
import Keyboard from 'finer/packages/keyboard/Keyboard';
import Options from '../Options';

const EditorSetup = (editor: Editor): Promise<void> => {
	const self = editor;
	return new Promise((resolve, reject) => {
		self.EditArea = self.Frame.Container;

		if (self.IsIFrame()) {
			self.DOM = DOM.New(
				(self.Frame.Container as HTMLIFrameElement).contentWindow as Window & typeof globalThis,
				(self.Frame.Container as HTMLIFrameElement).contentDocument as Document
			);

			self.DOM.Insert(self.DOM.Doc.head, DOM.Create('link', {
				attrs: {
					rel: 'stylesheet',
					href: Options.JoinUrl('css', 'finer')
				}
			}));

			self.DOM.SetAttrs(self.GetBody(), {
				id: DOM.Utils.CreateUEID('editor-body', false),
				contenteditable: 'true'
			});

			self.EditArea = self.DOM.Doc.body;
		}

		self.Utils = EditorUtils(self);
		Keyboard(self);

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
			})
			.catch(error => {
				self.Notify(ENotificationStatus.error, error);
				reject(error);
			});
	});
};

export default EditorSetup;