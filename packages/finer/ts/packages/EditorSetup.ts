import { NodeType } from '@dynafer/dom-control';
import { Str } from '@dynafer/utils';
import DOM from './dom/DOM';
import Editor from './Editor';
import EditorContainer from './EditorContainer';
import EventSetup from './events/EventSetup';
import { ENativeEvents } from './events/EventSetupUtils';
import Formatter from './formatter/Formatter';
import { CreateHistoryPath, GetHTMLHistory } from './history/Utils';
import FooterManager from './managers/FooterManager';
import PluginManager from './managers/PluginManager';
import PartsTool from './tools/Parts';
import Resizer from './tools/Resizer';

const EditorSetup = (editor: Editor): Promise<void> => {
	const self = editor;
	const frame = self.Frame;
	const config = self.Config;

	const editorContainer = EditorContainer(config.Skin);

	const setupContainer = (): HTMLElement | null => {
		const container = frame.Container;

		if (DOM.Utils.IsIFrame(container)) {
			self.SetWin(container.contentWindow as Window & typeof globalThis);

			self.DOM = DOM.New({
				document: container.contentDocument,
				bEditor: true,
				bSelfBody: true,
			});

			return editorContainer.IFrame(container);
		}

		const containerBody = editorContainer.Div(container);

		self.DOM = DOM.New({
			bEditor: true,
			bSelfBody: false,
			body: containerBody,
		});

		DOM.Insert(frame.Container, containerBody);

		return containerBody;
	};

	const setEditorBody = () => {
		const body = setupContainer();
		if (!body) throw new Error('Error occurred during setup Editor body');

		if (!DOM.Select({ id: editorContainer.DefaultCSSId }, DOM.Doc.head)) DOM.Insert(DOM.Doc.head, editorContainer.DefaultCss);
		if (!DOM.Select({ id: editorContainer.SkinCSSId }, DOM.Doc.head)) DOM.Insert(DOM.Doc.head, editorContainer.SkinCSSLink);

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
			Parts: PartsTool(self),
			Resizer: Resizer(self),
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
			.then(self.Plugin.AttachPlugin)
			.then(self.Utils.Event.Resolve)
			.then(() => resolve(self.Toolbar.LoadAll()))
			.catch(error => reject(error));
	});
};

export default EditorSetup;