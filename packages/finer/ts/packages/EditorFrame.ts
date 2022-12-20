import { Str } from '@dynafer/utils';
import { EModeEditor } from '../Options';
import { IConfiguration } from './EditorConfigure';
import DOM from './dom/DOM';

export interface IEditorFrame {
	Root: HTMLElement,
	Toolbar: HTMLElement,
	Notification: HTMLElement,
	Container: HTMLElement | HTMLIFrameElement,
	Loading: HTMLElement,
}

const EditorFrame = (config: IConfiguration): IEditorFrame => {
	const Root = DOM.Create('div', {
		attrs: {
			id: config.Id
		},
		styles: {
			width: config.Width,
		},
		class: DOM.Utils.CreateUEID(undefined, false)
	});

	const toolbarId: string = DOM.Utils.CreateUEID('toolbar', false);
	const Toolbar = DOM.Create('div', {
		attrs: {
			id: toolbarId,
			toolbarStyle: Str.LowerCase(config.ToolbarStyle),
		},
		class: toolbarId
	});

	const wrapperId: string = DOM.Utils.CreateUEID('wrapper', false);
	const wrapper = DOM.Create('div', {
		attrs: {
			id: wrapperId
		},
		class: wrapperId
	});

	const notificationId: string = DOM.Utils.CreateUEID('notification', false);
	const Notification = DOM.Create('div', {
		attrs: {
			id: notificationId
		},
		class: notificationId
	});

	const containerId: string = DOM.Utils.CreateUEID('container', false);
	const Container = DOM.Create(DOM.Utils.GetModeTag(config.Mode), {
		attrs: {
			id: containerId,
		},
		styles: {
			height: config.Height
		},
		class: DOM.Utils.CreateUEID(EModeEditor[config.Mode], false),
	});

	const loadingId: string = DOM.Utils.CreateUEID('loading', false);
	const Loading = DOM.Create('div', {
		attrs: {
			id: loadingId
		},
		class: loadingId,
		html: Finer.Icons.Get('Loading')
	});

	DOM.Hide(Notification);

	DOM.Insert(wrapper, Notification, Container);
	DOM.Insert(Root, Toolbar, wrapper, Loading);
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