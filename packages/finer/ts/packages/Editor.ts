import { Instance, Str } from '@dynafer/utils';
import Configure, { IEditorOption, IConfiguration } from './EditorConfigure';
import EditorDestroy from './EditorDestroy';
import EditorFrame, { IEditorFrame } from './EditorFrame';
import EditorSetup from './EditorSetup';
import DOM, { IDom, TEventListener } from './dom/DOM';
import { IEditorUtils } from './editorUtils/EditorUtils';
import { IEvent } from './editorUtils/EventUtils';
import { ENotificationStatus, INotificationManager, NotificationManager } from './managers/NotificationManager';

enum ELoadingStatus {
	show,
	hide
}

export interface IEditorConstructor {
	new(config: IEditorOption): Editor;
}

class Editor {
	public Id: string;
	public Config: IConfiguration;
	public Frame: IEditorFrame;
	public Notification!: INotificationManager;
	public DOM: IDom = DOM;
	public Utils!: IEditorUtils;

	private mbDestroyed: boolean = false;

	public constructor(config: IEditorOption) {
		const configuration: IConfiguration = Configure(config);

		this.Id = configuration.Id;
		this.Config = configuration;
		this.Frame = EditorFrame(configuration);
		this.Notification = NotificationManager(this);

		EditorSetup(this)
			.then(() => this.setLoading(ELoadingStatus.hide))
			.catch(error => this.Notify(ENotificationStatus.error, error as string));
	}

	public AddToolbar(toolbar: HTMLElement) {
		DOM.Insert(this.Frame.Toolbar, toolbar);
	}

	public Notify(type: ENotificationStatus, text: string) {
		this.Notification.Dispatch(type, text);
	}

	public On<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>): void;
	public On(eventName: string, event: IEvent): void;
	public On(eventName: string, event: IEvent) {
		this.Utils.Event.On(eventName, event);
	}

	public Dispatch(eventName: string, ...params: unknown[]) {
		if (!DOM.Utils.NativeEvents.includes(eventName)) {
			this.Utils.Event.Dispatch(eventName, ...params);
		} else {
			this.DOM.Dispatch(this.GetBody(), eventName);
		}
	}

	public IsDestroyed(): boolean {
		return this.mbDestroyed;
	}

	public IsIFrame(): boolean {
		return Instance.Is(this.Frame.Container, HTMLIFrameElement);
	}

	public GetBody(): HTMLElement {
		return this.IsIFrame() ? this.DOM.Doc.body : this.Frame.Container;
	}

	public GetRootDOM(): IDom {
		return DOM;
	}

	public Focus() {
		this.GetBody().focus();
	}

	public InitContent() {
		this.GetBody().innerHTML = '<p><br></p>';
	}

	public Destroy() {
		this.mbDestroyed = true;
		EditorDestroy.Destroy(this);
	}

	public SetContent(html: string) {
		if (Str.IsEmpty(html)) this.InitContent();
		if (!Str.IsEmpty(html) && this.IsIFrame()) this.GetBody().innerHTML = html;
	}

	private setLoading(status: ELoadingStatus) {
		if (status === ELoadingStatus.hide)
			DOM.Hide(this.Frame.Loading);
		else
			DOM.Show(this.Frame.Loading);
	}
}

export default Editor;