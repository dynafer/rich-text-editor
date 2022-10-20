import { Type } from 'dynafer/utils';
import { IConfiguration } from 'finer/packages/Configuration';
import EditorDestroy from 'finer/packages/EditorDestroy';
import EditorSetup from 'finer/packages/EditorSetup';
import EditorFrame, { IEditorFrame } from 'finer/packages/EditorFrame';
import DOM, { IDom, TEventListener } from 'finer/packages/dom/DOM';
import { IEditorUtils } from 'finer/packages/editorUtils/EditorUtils';
import { ENotificationStatus, INotificationManager, NotificationManager } from 'finer/packages/managers/NotificationManager';
import { TEvent, TEventParameter } from 'finer/packages/editorUtils/EventUtils';

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
	public EditArea!: HTMLElement;
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
	public On(eventName: string, event: EventListener | TEvent): void;
	public On(eventName: string, event: EventListener | TEvent) {
		if (!DOM.Utils.NativeEvents.includes(eventName)) {
			this.Utils.Event.On(eventName, event as TEvent);
		} else {
			this.DOM.On(this.GetBody(), eventName, event);
		}
	}

	public Dispatch(eventName: string, ...params: TEventParameter[]) {
		if (!DOM.Utils.NativeEvents.includes(eventName)) {
			this.Utils.Event.Dispatch(eventName, ...params);
		} else {
			this.DOM.Dispatch(this.GetBody(), eventName);
		}
	}

	public Destroy() {
		this.mbDestroyed = true;
		EditorDestroy.Destroy(this);
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

	public SetContent(html: string) {
		if (Type.IsEmpty(html)) html = '<p><br></p>';
		if (this.IsIFrame()) this.EditArea.innerHTML = html;
		this.Dispatch('content:change');
	}

	private setLoading(status: ELoadingStatus) {
		if (status === ELoadingStatus.hide)
			DOM.Hide(this.Frame.Loading);
		else
			DOM.Show(this.Frame.Loading);
	}
}

export default Editor;