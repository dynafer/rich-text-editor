import { Instance } from '@dynafer/utils';
import Options from '../Options';
import Editor from './Editor';
import DOM from './dom/DOM';
import EditorUtils from './editorUtils/EditorUtils';
import EventSetup from './events/EventSetup';
import { Formatter } from './format/Formatter';
import PluginManager from './managers/PluginManager';

const EditorSetup = (editor: Editor): Promise<void> => {
	const self = editor;
	const frame = self.Frame;

	return new Promise((resolve, reject) => {
		let initialContent: string;
		if (Instance.Is(self.Config.Selector, HTMLTextAreaElement)) {
			initialContent = self.Config.Selector.value;
			self.Config.Selector.value = '';
		} else {
			initialContent = self.Config.Selector.innerHTML;
			self.Config.Selector.innerHTML = '';
		}

		const bodyId = DOM.Utils.CreateUEID('editor-body', false);
		let body: HTMLElement;

		if (self.IsIFrame()) {
			self.DOM = DOM.New(
				(frame.Container as HTMLIFrameElement).contentWindow as Window & typeof globalThis,
				(frame.Container as HTMLIFrameElement).contentDocument ?? document
			);

			const iframeHTML = `<!DOCTYPE html>
				<html>
					<head>
						<link rel="stylesheet" href="${Options.JoinUrl('css', 'skins/simple/skin')}">
					</head>
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

		self.SetBody(body);
		self.SetContent(initialContent);

		self.Utils = EditorUtils(self);
		self.Plugin = PluginManager(self);
		EventSetup(self);
		self.Formatter = Formatter(self);

		for (const toolbar of self.Config.Toolbars) {
			self.Formatter.Register(toolbar);
		}

		finer.Loaders.Plugin.LoadParallel(self.Config.Plugins)
			.then(() => self.Plugin.AttachPlugin())
			.then(() => resolve())
			.catch(error => reject(error));
	});
};

export default EditorSetup;