import DOM from 'finer/packages/dom/DOM';
import { Utils } from 'dynafer/utils';
import Editor from './Editor';

export interface IEditorFrame {
	root: HTMLElement,
	toolbar: HTMLElement,
	container: HTMLElement | HTMLIFrameElement
}

const EditorFrame = (editor: Editor): IEditorFrame => {
	const root = DOM.Create('div', {
		attrs: {
			id: editor.id
		},
		styles: {
			width: editor.width,
		},
		class: Utils.CreateUEID(undefined, false)
	});

	const toolbarId: string = Utils.CreateUEID('toolbar', false);
	const toolbar = DOM.Create('div', {
		attrs: {
			id: toolbarId,
		},
		class: toolbarId
	});
	DOM.Insert(root, toolbar);

	const container = DOM.Create(editor.GetModeTag(), {
		attrs: {
			id: Utils.CreateUEID('container', false),
			frameborder: '0',
		},
		styles: {
			height: editor.height
		},
		class: Utils.CreateUEID(editor.mode, false)
	});

	DOM.Insert(root, container);

	DOM.InsertAfter(editor.selector, root);

	return {
		root,
		toolbar,
		container
	};
};

export default EditorFrame;