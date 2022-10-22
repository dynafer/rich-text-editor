import { Str, Type } from 'dynafer/utils';
import { IConfiguration } from 'finer/packages/EditorConfigure';
import EditorDestroy from 'finer/packages/EditorDestroy';
import EditorFrame, { IEditorFrame } from 'finer/packages/EditorFrame';
import EditorSetup from 'finer/packages/EditorSetup';
import DOM, { IDom, TEventListener } from 'finer/packages/dom/DOM';
import { IEditorUtils } from 'finer/packages/editorUtils/EditorUtils';
import { IEvent } from 'finer/packages/editorUtils/EventUtils';
import { ENotificationStatus, INotificationManager, NotificationManager } from 'finer/packages/managers/NotificationManager';

enum ELoadingStatus {
	show,
	hide
}

class Editor {
	public Id: string;
	public Config: IConfiguration;
	public Frame: IEditorFrame;
	public Notification!: INotificationManager;
	public DOM: IDom = DOM;
	public Utils!: IEditorUtils;

	private mbDestroyed: boolean = false;

	public constructor(config: IConfiguration) {
		this.Id = config.Id;
		this.Config = config;
		this.Frame = EditorFrame(config);
		this.Notification = NotificationManager(this);

		EditorSetup(this)
			.then(() => this.setLoading(ELoadingStatus.hide))
			.catch(error => this.Notify(ENotificationStatus.error, error));
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
		return Type.IsInstance(this.Frame.Container, HTMLIFrameElement);
	}

	public GetBody(): HTMLElement {
		return this.IsIFrame() ? this.DOM.Doc.body : this.Frame.Container;
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