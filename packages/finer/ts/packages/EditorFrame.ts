import DOM from 'finer/packages/dom/DOM';
import Editor from 'finer/packages/Editor';
import { EModeEditor } from 'finer/packages/Configuration';

export interface IEditorFrame {
	Root: HTMLElement,
	Toolbar: HTMLElement,
	Notification: HTMLElement,
	Container: HTMLElement | HTMLIFrameElement
}

const EditorFrame = (editor: Editor): IEditorFrame => {
	const toolbarId: string = editor.CreateUEID('toolbar', false);
	const wrapperId: string = editor.CreateUEID('wrapper', false);
	const notificationId: string = editor.CreateUEID('notification', false);
	const containerId: string = editor.CreateUEID('container', false);

	const Root = DOM.Create('div', {
		attrs: {
			id: editor.Id
		},
		styles: {
			width: editor.Config.Width,
		},
		class: editor.CreateUEID(undefined, false)
	});

	const Toolbar = DOM.Create('div', {
		attrs: {
			id: toolbarId,
		},
		class: toolbarId
	});
	DOM.Insert(Root, Toolbar);

	const wrapper = DOM.Create('div', {
		attrs: {
			id: wrapperId
		},
		class: wrapperId,
		children: [
			DOM.Create('div', {
				attrs: {
					id: notificationId
				},
				class: notificationId
			}),
			DOM.Create(editor.GetModeTag(), {
				attrs: {
					id: containerId,
				},
				styles: {
					height: editor.Config.Height
				},
				class: editor.CreateUEID(EModeEditor[editor.Config.Mode], false)
			})
		]
	});

	DOM.Insert(Root, wrapper);

	DOM.InsertAfter(editor.Config.Selector, Root);

	const Notification = DOM.Select(`#${notificationId}`, wrapper) as HTMLElement;
	const Container = DOM.Select(`#${containerId}`, wrapper) as HTMLElement;

	if (Container instanceof HTMLIFrameElement) {
		DOM.SetAttr((Container.contentDocument as Document).body, 'contenteditable', 'true');
	}

	return {
		Root,
		Toolbar,
		Notification,
		Container
	};
};

export default EditorFrame;