import { IConfiguration } from 'finer/packages/EditorConfigure';
import DOM from 'finer/packages/dom/DOM';
import * as Icons from 'finer/packages/icons/Icons';
import { EModeEditor } from '../Options';

export interface IEditorFrame {
	Root: HTMLElement,
	Toolbar: HTMLElement,
	Notification: HTMLElement,
	Container: HTMLElement | HTMLIFrameElement,
	Loading: HTMLElement,
}

const EditorFrame = (config: IConfiguration): IEditorFrame => {
	const toolbarId: string = DOM.Utils.CreateUEID('toolbar', false);
	const wrapperId: string = DOM.Utils.CreateUEID('wrapper', false);
	const notificationId: string = DOM.Utils.CreateUEID('notification', false);
	const containerId: string = DOM.Utils.CreateUEID('container', false);
	const loadingId: string = DOM.Utils.CreateUEID('loading', false);

	const Root = DOM.Create('div', {
		attrs: {
			id: config.Id
		},
		styles: {
			width: config.Width,
		},
		class: DOM.Utils.CreateUEID(undefined, false)
	});

	const Toolbar = DOM.Create('div', {
		attrs: {
			id: toolbarId,
		},
		class: toolbarId
	});

	const wrapper = DOM.Create('div', {
		attrs: {
			id: wrapperId
		},
		class: wrapperId
	});

	const Notification = DOM.Create('div', {
		attrs: {
			id: notificationId
		},
		class: notificationId
	});

	const Container = DOM.Create(DOM.Utils.GetModeTag(config.Mode), {
		attrs: {
			id: containerId,
		},
		styles: {
			height: config.Height
		},
		class: DOM.Utils.CreateUEID(EModeEditor[config.Mode], false),
	});

	const Loading = DOM.Create('div', {
		attrs: {
			id: loadingId
		},
		class: loadingId,
		html: Icons.Loading
	});

	DOM.Hide(Notification);

	DOM.Insert(wrapper, Notification);
	DOM.Insert(wrapper, Container);

	DOM.Insert(Root, Toolbar);
	DOM.Insert(Root, wrapper);
	DOM.Insert(Root, Loading);
	DOM.InsertAfter(config.Selector, Root);

	return {
		Root,
		Toolbar,
		Notification,
		Container,
		Loading,
	};
};

export default EditorFrame;