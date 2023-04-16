import { Str } from '@dynafer/utils';
import Options, { EModeEditor } from '../Options';
import DOM from './dom/DOM';
import { IConfiguration } from './EditorConfigure';

export interface IEditorFrame {
	readonly Root: HTMLElement,
	readonly Toolbar: HTMLElement,
	readonly Notification: HTMLElement,
	readonly Wrapper: HTMLElement,
	readonly Container: HTMLElement | HTMLIFrameElement,
	readonly Loading: HTMLElement,
}

const EditorFrame = (config: IConfiguration): IEditorFrame => {
	const Root = DOM.Create('div', {
		attrs: {
			id: config.Id,
			mode: EModeEditor[config.Mode],
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
		class: containerId,
	});

	const loadingWrapId = DOM.Utils.CreateUEID('loading-wrap', false);
	const loadingId = DOM.Utils.CreateUEID('loading', false);
	const LoadingWrap = DOM.Create('div', {
		attrs: {
			id: loadingWrapId
		},
		class: loadingWrapId,
		children: [
			DOM.Create('div', {
				attrs: {
					id: loadingId
				},
				class: loadingId,
			}),
			DOM.Create('span', {
				html: Str.CapitaliseFirst(Options.SHORT_NAME)
			})
		]
	});

	DOM.Hide(Notification);

	DOM.Insert(Wrapper, Notification, Container);
	DOM.Insert(Root, Toolbar, Wrapper, LoadingWrap);
	DOM.InsertAfter(config.Selector, Root);

	return {
		Root,
		Toolbar,
		Notification,
		Wrapper,
		Container,
		Loading: LoadingWrap,
	};
};

export default EditorFrame;