import { Str } from '@dynafer/utils';
import { EModeEditor } from '../Options';
import DOM from './dom/DOM';
import { IConfiguration } from './EditorConfigure';
import { CreateFooter } from './managers/FooterManager';

export interface IEditorFrame {
	readonly Root: HTMLElement,
	readonly Toolbar: HTMLElement,
	readonly Notification: HTMLElement,
	readonly Wrapper: HTMLElement,
	readonly Container: HTMLElement | HTMLIFrameElement,
	readonly Footer: HTMLElement | null,
	readonly Loading: HTMLElement,
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

	const toolbarId = DOM.Utils.CreateUEID('toolbar', false);
	const Toolbar = DOM.Create('div', {
		attrs: {
			id: toolbarId,
			toolbarStyle: Str.LowerCase(config.ToolbarStyle),
		},
		class: toolbarId
	});

	const wrapperId = DOM.Utils.CreateUEID('wrapper', false);
	const Wrapper = DOM.Create('div', {
		attrs: {
			id: wrapperId
		},
		class: wrapperId
	});

	const notificationId = DOM.Utils.CreateUEID('notification', false);
	const Notification = DOM.Create('div', {
		attrs: {
			id: notificationId
		},
		class: notificationId
	});

	const containerId = DOM.Utils.CreateUEID('container', false);
	const Container = DOM.Create(DOM.Utils.GetModeTag(config.Mode), {
		attrs: {
			id: containerId,
		},
		styles: {
			height: config.Height
		},
		class: DOM.Utils.CreateUEID(EModeEditor[config.Mode], false),
	});

	const Footer = config.ShowFooter ? CreateFooter() : null;

	const loadingId = DOM.Utils.CreateUEID('loading', false);
	const Loading = DOM.Create('div', {
		attrs: {
			id: loadingId
		},
		class: loadingId,
		html: Finer.Icons.Get('Loading')
	});

	DOM.Hide(Notification);

	DOM.Insert(Wrapper, Notification, Container, Footer);
	DOM.Insert(Root, Toolbar, Wrapper, Loading);
	DOM.InsertAfter(config.Selector, Root);

	return {
		Root,
		Toolbar,
		Notification,
		Wrapper,
		Container,
		Footer,
		Loading,
	};
};

export default EditorFrame;