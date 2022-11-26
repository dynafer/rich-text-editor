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

	const bodyId = DOM.Utils.CreateUEID('editor-body', false);
	const editorDefaultId = DOM.Utils.CreateUEID('editor-default', false);
	const editorDefaultCss = `<link id="${editorDefaultId}" rel="stylesheet" href="${Options.JoinUrl('css', 'skins/Editor')}">`;

	const createIframe = () => {
		self.DOM = DOM.New(
			(frame.Container as HTMLIFrameElement).contentWindow as Window & typeof globalThis,
			(frame.Container as HTMLIFrameElement).contentDocument ?? document,
			true
		);

		const iframeHTML = `<!DOCTYPE html>
			<html>
				<head>${editorDefaultCss}</head>
				<body id="${bodyId}" contenteditable="true"></body>
			</html>`;

		(frame.Container as HTMLIFrameElement).contentDocument?.write(iframeHTML);
		(frame.Container as HTMLIFrameElement).contentDocument?.close();

		return self.DOM.Doc.body;
	};

	const createDiv = () => {
		const containerBody = DOM.Create('div', {
			attrs: {
				id: bodyId,
				contenteditable: 'true'
			}
		});

		DOM.Insert(frame.Container, containerBody);

		return containerBody;
	};

	const setEditorBody = () => {
		const skinId = DOM.Utils.CreateUEID('skin', false);
		const skinLink = `<link id="${skinId}" rel="stylesheet" href="${Options.JoinUrl('css', `skins/${config.Skin}/skin`)}">`;
		const body: HTMLElement = self.IsIFrame() ? createIframe() : createDiv();

		if (!DOM.Select(`#${editorDefaultId}`, DOM.Doc.head)) DOM.Insert(DOM.Doc.head, editorDefaultCss);
		if (!DOM.Select(`#${skinId}`, DOM.Doc.head)) DOM.Insert(DOM.Doc.head, skinLink);

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
	};

	return new Promise((resolve, reject) => {
		setEditorBody();

		self.Utils = EditorUtils(self);
		self.Plugin = PluginManager(self);
		EventSetup(self);
		self.Formatter = Formatter(self);

		const plugins = config.Plugins.filter((plugin) => !self.Formatter.Formats.IsAailable(plugin));

		Finer.Loaders.Plugin.LoadParallel(plugins)
			.then(() => self.Plugin.AttachPlugin())
			.then(() => {
				self.Toolbar.LoadAll();
				resolve();
			})
			.catch(error => reject(error));
	});
};

export default EditorSetup;