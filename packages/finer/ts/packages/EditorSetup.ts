import { Instance } from '@dynafer/utils';
import Options from '../Options';
import Editor from './Editor';
import DOM from './dom/DOM';
import EditorUtils from './editorUtils/EditorUtils';
import EventSetup from './events/EventSetup';
import { Formatter } from './formatter/Formatter';
import PluginManager from './managers/PluginManager';

const EditorSetup = (editor: Editor): Promise<void> => {
	const self = editor;
	const frame = self.Frame;
	const config = self.Config;

	return new Promise((resolve, reject) => {
		const bodyId = DOM.Utils.CreateUEID('editor-body', false);
		const skinId = DOM.Utils.CreateUEID('skin', false);
		const skinLink = `<link id="${skinId}" rel="stylesheet" href="${Options.JoinUrl('css', 'skins/simple/skin')}">`;
		let body: HTMLElement;

		if (!DOM.Select(`#${skinId}`, DOM.Doc.head)) DOM.Insert(DOM.Doc.head, skinLink);

		if (self.IsIFrame()) {
			self.DOM = DOM.New(
				(frame.Container as HTMLIFrameElement).contentWindow as Window & typeof globalThis,
				(frame.Container as HTMLIFrameElement).contentDocument ?? document
			);

			const iframeHTML = `<!DOCTYPE html>
				<html>
					<head>${skinLink}</head>
					<body id="${bodyId}" contenteditable="true"></body>
				</html>`;

			(frame.Container as HTMLIFrameElement).contentDocument?.write(iframeHTML);
			(frame.Container as HTMLIFrameElement).contentDocument?.close();

			body = self.DOM.Doc.body;
		} else {
			const containerBody = DOM.Create('div', {
				attrs: {
					id: bodyId,
					contenteditable: 'true'
				}
			});

			DOM.Insert(frame.Container, containerBody);

			body = containerBody;
		}

		let initialContent: string;
		if (Instance.Is(config.Selector, HTMLTextAreaElement)) {
			initialContent = config.Selector.value;
			config.Selector.value = '';
		} else {
			initialContent = DOM.GetHTML(config.Selector);
			DOM.SetHTML(config.Selector, '');
		}

		self.SetBody(body);
		self.SetContent(initialContent);

		self.Utils = EditorUtils(self);
		self.Plugin = PluginManager(self);
		EventSetup(self);
		self.Formatter = Formatter(self);

		const plugins = config.Plugins.filter((plugin) => !self.Formatter.Formats.IsAailable(plugin));

		for (const toolbar of config.Toolbars) {
			self.Formatter.Register(toolbar);
		}

		Finer.Loaders.Plugin.LoadParallel(plugins)
			.then(() => self.Plugin.AttachPlugin())
			.then(() => resolve())
			.catch(error => reject(error));
	});
};

export default EditorSetup;