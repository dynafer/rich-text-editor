import { Arr, Instance, Str } from '@dynafer/utils';
import Configure, { IEditorOption, IConfiguration } from './EditorConfigure';
import EditorDestroy from './EditorDestroy';
import EditorFrame, { IEditorFrame } from './EditorFrame';
import EditorSetup from './EditorSetup';
import DOM, { IDom, TEventListener } from './dom/DOM';
import { IEditorUtils } from './editorUtils/EditorUtils';
import { IEvent } from './editorUtils/EventUtils';
import { ENativeEvents } from './events/EventSetupUtils';
import { IFormatter } from './formatter/Formatter';
import { ENotificationStatus, INotificationManager, NotificationManager } from './managers/NotificationManager';
import { IPluginManager } from './managers/PluginManager';
import EditorToolbar, { IEditorToolbar } from './EditorToolbar';
import Commander, { ICommander } from './commander/Commander';

enum ELoadingStatus {
	SHOW = 'SHOW',
	HIDE = 'HIDE'
}

export interface IEditorConstructor {
	new(config: IEditorOption): Editor;
}

class Editor {
	public Id: string;
	public Config: IConfiguration;
	public Frame: IEditorFrame;
	public Notification: INotificationManager;
	public Plugin!: IPluginManager;
	public DOM: IDom = DOM.New(window, document, true);
	public Commander: ICommander = Commander();
	public Utils!: IEditorUtils;
	public Formatter!: IFormatter;
	public Toolbar: IEditorToolbar;

	private mBody!: HTMLElement;
	private mbDestroyed: boolean = false;

	public constructor(config: IEditorOption) {
		const configuration: IConfiguration = Configure(config);

		this.Id = configuration.Id;
		this.Config = configuration;
		this.Frame = EditorFrame(configuration);
		this.Notification = NotificationManager(this);
		this.Toolbar = EditorToolbar(this);

		EditorSetup(this)
			.then(() => this.setLoading(ELoadingStatus.HIDE))
			.catch(error => this.Notify(ENotificationStatus.ERROR, error as string));
	}

	public Notify(type: ENotificationStatus, text: string) {
		this.Notification.Dispatch(type, text);
	}

	public On<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>): void;
	public On(eventName: string, event: IEvent): void;
	public On<T = unknown>(eventName: string, event: IEvent<T>): void;
	public On(eventName: string, event: IEvent) {
		this.Utils.Event.On(eventName, event);
	}

	public Off<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>): void;
	public Off(eventName: string, event: IEvent): void;
	public Off(eventName: string, event: IEvent) {
		this.Utils.Event.Off(eventName, event);
	}

	public Dispatch(eventName: string, ...params: unknown[]) {
		if (!ENativeEvents[eventName]) {
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

	// body getter and setter
	public SetBody(body: HTMLElement) { this.mBody = body; }
	public GetBody(): HTMLElement { return this.mBody; }

	public GetRootDOM(): IDom {
		return DOM;
	}

	public Focus() {
		const carets = this.Utils.Caret.Get();
		const copiedRanges: Range[] = [];
		for (const caret of carets) {
			Arr.Push(copiedRanges, caret.Range.Clone());
		}

		if (Arr.IsEmpty(copiedRanges)) {
			const newRange = this.Utils.Range();
			const firstLine = DOM.Utils.GetFirstChild(this.GetBody());
			let firstNode = DOM.Utils.GetFirstChild(firstLine, true);
			if (DOM.Utils.IsBr(firstNode)) firstNode = firstNode.parentNode;
			newRange.SetStartToEnd(firstNode ?? this.GetBody(), 0, 0);
			Arr.Push(copiedRanges, newRange.Get());
		}

		this.GetBody().focus();
		this.Utils.Caret.UpdateRanges(copiedRanges);
		this.Utils.Caret.Clean();
	}

	public CreateEmptyParagraph(): HTMLElement {
		return this.DOM.Create('p', {
			html: '<br>'
		});
	}

	public InitContent(html: string = '<p><br></p>') {
		this.DOM.SetHTML(this.GetBody(), html);
	}

	public Destroy() {
		this.mbDestroyed = true;
		EditorDestroy.Destroy(this);
	}

	public SetContent(html: string) {
		if (Str.IsEmpty(html)) this.InitContent();
		if (!Str.IsEmpty(html) && this.IsIFrame()) this.InitContent(html);
	}

	private setLoading(status: ELoadingStatus) {
		if (status === ELoadingStatus.HIDE)
			DOM.Hide(this.Frame.Loading);
		else
			DOM.Show(this.Frame.Loading);
	}
}

export default Editor;