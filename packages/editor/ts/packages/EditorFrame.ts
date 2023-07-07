import { Str } from '@dynafer/utils';
import Options, { EEditorMode } from '../Options';
import DOM from './dom/DOM';
import { IConfiguration } from './EditorConfigure';

export interface IEditorFrame {
	readonly Root: HTMLElement,
	readonly Toolbar: HTMLElement,
	readonly Notification: HTMLElement,
	readonly Wrapper: HTMLElement,
	readonly Container: HTMLElement | HTMLIFrameElement,
	readonly Loading: HTMLElement,
	readonly Resizer: HTMLElement | null,
}

const EditorFrame = (config: IConfiguration): IEditorFrame => {
	const Root = DOM.Create('div', {
		attrs: {
			id: DOM.Utils.CreateUEID(),
			mode: EEditorMode[config.Mode],
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
	const Container = DOM.Create(Options.GetModeTag(config.Mode), {
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

	const Resizer = config.Mode !== EEditorMode.inline && config.Resizable ? DOM.Create('button', {
		class: DOM.Utils.CreateUEID('resizer', false),
		html: RichEditor.Icons.Get('Resize'),
	}) : null;

	DOM.Hide(Notification);

	DOM.Insert(Wrapper, Notification, Container);
	DOM.Insert(Root, Toolbar, Wrapper, LoadingWrap, Resizer);
	DOM.InsertAfter(config.Selector, Root);

	return {
		Root,
		Toolbar,
		Notification,
		Wrapper,
		Container,
		Loading: LoadingWrap,
		Resizer,
	};
};

export default EditorFrame;