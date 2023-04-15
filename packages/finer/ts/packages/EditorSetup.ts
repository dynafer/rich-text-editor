import { NodeType } from '@dynafer/dom-control';
import { Str } from '@dynafer/utils';
import Options from '../Options';
import DOM from './dom/DOM';
import DOMTools from './dom/DOMTools';
import Editor from './Editor';
import EventSetup from './events/EventSetup';
import { ENativeEvents } from './events/EventSetupUtils';
import Formatter from './formatter/Formatter';
import { CreateHistoryPath, GetHTMLHistory } from './history/Utils';
import FooterManager from './managers/FooterManager';
import PluginManager from './managers/PluginManager';

const EditorSetup = (editor: Editor): Promise<void> => {
	const self = editor;
	const frame = self.Frame;
	const config = self.Config;

	const bodyId = DOM.Utils.CreateUEID('editor-body', false);
	const editorDefaultId = DOM.Utils.CreateUEID('editor-default', false);
	const editorDefaultCss = `<link id="${editorDefaultId}" rel="stylesheet" href="${Options.JoinURL('css', 'skins/Editor')}">`;

	const skinId = DOM.Utils.CreateUEID('skin', false);
	const skinLink = `<link id="${skinId}" rel="stylesheet" href="${Options.JoinURL('css', `skins/${config.Skin}/skin`)}">`;

	const createIframe = (): HTMLElement => {
		const container = frame.Container as HTMLIFrameElement;

		self.SetWin(container.contentWindow as Window & typeof globalThis);

		self.DOM = DOM.New({
			document: container.contentDocument,
			bEditor: true,
			bSelfBody: true,
		});

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

		self.DOM = DOM.New({
			bEditor: true,
			bSelfBody: false,
			body: containerBody,
		});

		DOM.Insert(frame.Container, containerBody);

		return containerBody;
	};

	const setEditorBody = () => {
		const body = self.IsIFrame() ? createIframe() : createDiv();

		if (!DOM.Select({ id: editorDefaultId }, DOM.Doc.head)) DOM.Insert(DOM.Doc.head, editorDefaultCss);
		if (!DOM.Select({ id: skinId }, DOM.Doc.head)) DOM.Insert(DOM.Doc.head, skinLink);

		let initialContent: string;
		if (DOM.Utils.IsTextArea(config.Selector)) {
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

		self.On(ENativeEvents.click, () => {
			if (self.IsFocused()) return;
			self.Focus();
		});

		self.Tools = {
			DOM: DOMTools(self)
		};

		self.Plugin = PluginManager(self);
		if (config.ShowFooter) self.Footer = FooterManager(self);
		EventSetup(self);
		self.Formatter = Formatter(self);
		self.Footer?.UpdateCounter();

		self.CleanDirty();

		self.Focus();
		const lastChild = DOM.Utils.GetLastChild(self.GetBody(), true);
		if (lastChild) {
			const newRange = self.Utils.Range();
			const offset = NodeType.IsText(lastChild) ? lastChild.length : 0;
			newRange.SetStartToEnd(lastChild, offset, offset);
			self.Utils.Caret.UpdateRange(newRange);
		}

		const history = CreateHistoryPath(self, self.Utils.Caret.Get() ?? []);
		if (history) self.History.Record({
			data: GetHTMLHistory(self),
			redo: history
		});

		Finer.Loaders.Plugin.LoadParallel(config.Plugins)
			.then(() => self.Plugin.AttachPlugin())
			.then(() => resolve(self.Toolbar.LoadAll()))
			.catch(error => reject(error));
	});
};

export default EditorSetup;