import { Instance, Str } from '@dynafer/utils';
import Options from '../Options';
import DOM from './dom/DOM';
import DOMTools from './dom/DOMTools';
import Editor from './Editor';
import EditorUtils from './editorUtils/EditorUtils';
import EventSetup from './events/EventSetup';
import Formatter from './formatter/Formatter';
import PluginManager from './managers/PluginManager';

const EditorSetup = (editor: Editor): Promise<void> => {
	const self = editor;
	const frame = self.Frame;
	const config = self.Config;

	const bodyId = DOM.Utils.CreateUEID('editor-body', false);
	const editorDefaultId = DOM.Utils.CreateUEID('editor-default', false);
	const editorDefaultCss = `<link id="${editorDefaultId}" rel="stylesheet" href="${Options.JoinUrl('css', 'skins/Editor')}">`;

	const skinId = DOM.Utils.CreateUEID('skin', false);
	const skinLink = `<link id="${skinId}" rel="stylesheet" href="${Options.JoinUrl('css', `skins/${config.Skin}/skin`)}">`;

	const createIframe = (): HTMLElement => {
		const container = frame.Container as HTMLIFrameElement;

		self.DOM = DOM.New(
			container.contentWindow as Window & typeof globalThis,
			container.contentDocument ?? document,
			true
		);

		const iframeHTML = Str.Merge('<!DOCTYPE html>',
			'<html>',
			`<head>${skinLink}${editorDefaultCss}</head>`,
			`<body id="${bodyId}" contenteditable="true"></body>`,
			'</html>');

		container.contentDocument?.write(iframeHTML);
		container.contentDocument?.close();

		return self.DOM.Doc.body;
	};

	const createDiv = (): HTMLElement => {
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
		const body: HTMLElement = self.IsIFrame() ? createIframe() : createDiv();

		if (!DOM.Select({ id: editorDefaultId }, DOM.Doc.head)) DOM.Insert(DOM.Doc.head, editorDefaultCss);
		if (!DOM.Select({ id: skinId }, DOM.Doc.head)) DOM.Insert(DOM.Doc.head, skinLink);

		let initialContent: string;
		if (Instance.Is(config.Selector, HTMLTextAreaElement)) {
			initialContent = config.Selector.value;
			if (Str.IsEmpty(initialContent)) initialContent = config.Selector.innerHTML.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
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

		self.Tools = {
			DOM: DOMTools(self)
		};

		self.Utils = EditorUtils(self);
		self.Plugin = PluginManager(self);
		EventSetup(self);
		self.Formatter = Formatter(self);

		Finer.Loaders.Plugin.LoadParallel(config.Plugins)
			.then(() => self.Plugin.AttachPlugin())
			.then(() => {
				self.Toolbar.LoadAll();
				resolve();
			})
			.catch(error => reject(error));
	});
};

export default EditorSetup;