import { Arr, Instance, Str } from '@dynafer/utils';
import Options from '../Options';
import Commander, { ICommander } from './commander/Commander';
import DOM, { IDom, TEventListener } from './dom/DOM';
import { IDOMTools } from './dom/DOMTools';
import Configure, { IConfiguration, IEditorConfiguration } from './EditorConfigure';
import EditorDestroy from './EditorDestroy';
import EditorFrame, { IEditorFrame } from './EditorFrame';
import EditorSetup from './EditorSetup';
import EditorToolbar, { IEditorToolbar } from './EditorToolbar';
import { IRangeUtils } from './editorUtils/caret/RangeUtils';
import { IEditorUtils } from './editorUtils/EditorUtils';
import { IEvent } from './editorUtils/EventUtils';
import { ENativeEvents } from './events/EventSetupUtils';
import { IFormatter } from './formatter/Formatter';
import { ENotificationStatus, INotificationManager, NotificationManager } from './managers/NotificationManager';
import { IPluginManager } from './managers/PluginManager';

enum ELoadingStatus {
	SHOW = 'SHOW',
	HIDE = 'HIDE'
}

interface IEditorTools {
	readonly DOM: IDOMTools,
}

export interface IEditorConstructor {
	new(config: IEditorConfiguration): Editor;
}

class Editor {
	public readonly Id: string;
	public readonly Config: IConfiguration;
	public readonly Frame: IEditorFrame;
	public readonly Notification: INotificationManager;
	public Plugin!: IPluginManager;
	public DOM!: IDom;
	public readonly Commander: ICommander = Commander();
	public Utils!: IEditorUtils;
	public Formatter!: IFormatter;
	public readonly Toolbar: IEditorToolbar;
	public Tools!: IEditorTools;

	private mBody!: HTMLElement;
	private mbDestroyed: boolean = false;
	private mbAdjusting: boolean = false;
	private mScrollX: number = -1;
	private mScrollY: number = -1;

	public constructor(config: IEditorConfiguration) {
		const configuration: IConfiguration = Configure(config);

		this.Id = configuration.Id;
		this.Config = configuration;
		this.Frame = EditorFrame(configuration);
		this.Notification = NotificationManager(this);
		this.Toolbar = EditorToolbar(this);

		EditorSetup(this)
			.then(() => this.setLoading(ELoadingStatus.HIDE))
			.catch(error => this.Notify(ENotificationStatus.ERROR, error, true));
	}

	public Notify(type: ENotificationStatus, text: string, bDestroy?: boolean) {
		this.Notification.Dispatch(type, text, bDestroy);
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
		if (!ENativeEvents[eventName as ENativeEvents])
			return this.Utils.Event.Dispatch(eventName, ...params);
		this.DOM.Dispatch(this.GetBody(), eventName);
	}

	public IsDestroyed(): boolean {
		return this.mbDestroyed;
	}

	public IsAdjusting(): boolean {
		return this.mbAdjusting;
	}

	public SetAdjusting(bAdjusting: boolean) { this.mbAdjusting = bAdjusting; }

	public IsIFrame(): boolean {
		return Instance.Is(this.Frame.Container, HTMLIFrameElement);
	}

	// body getter and setter
	public SetBody(body: HTMLElement) { this.mBody = body; }
	public GetBody(): HTMLElement { return this.mBody; }

	public GetRootDOM(): IDom {
		return DOM;
	}

	public SaveScrollPosition() {
		this.mScrollX = this.DOM.GetRoot().scrollLeft;
		this.mScrollY = this.DOM.GetRoot().scrollTop;
	}

	public ScrollSavedPosition() {
		if (this.mScrollX !== -1) this.DOM.GetRoot().scroll({ left: this.mScrollX });
		if (this.mScrollY !== -1) this.DOM.GetRoot().scroll({ top: this.mScrollY });

		this.mScrollX = -1;
		this.mScrollY = -1;
	}

	public Focus() {
		this.SaveScrollPosition();
		const caret = this.Utils.Caret.Get();
		let copiedRange: IRangeUtils | null = caret?.Range.Clone() ?? null;

		const cells = DOM.Element.Table.GetSelectedCells(this);
		if (!Arr.IsEmpty(cells)) {
			Arr.Each(cells, cell => DOM.SetAttr(cell, Options.ATTRIBUTE_SELECTED));
			return this.ScrollSavedPosition();
		}

		if (!copiedRange) {
			const newRange = this.Utils.Range();
			const firstLine = DOM.Utils.GetFirstChild(this.GetBody());
			let firstNode = DOM.Utils.GetFirstChild(firstLine, true);
			if (DOM.Utils.IsBr(firstNode)) firstNode = firstNode.parentNode;
			newRange.SetStartToEnd(firstNode ?? this.GetBody(), 0, 0);
			copiedRange = newRange;
		}

		this.GetBody().focus();
		this.Utils.Caret.UpdateRange(copiedRange);
		this.ScrollSavedPosition();
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
		if (Str.IsEmpty(html)) return this.InitContent();
		this.InitContent(html);
	}

	public GetLines(bArray?: true): Element[];
	public GetLines(bArray: false): HTMLCollection;
	public GetLines<T extends boolean>(bArray: T | true = true): T extends true ? Element[] : HTMLCollection {
		return this.DOM.GetChildren(this.GetBody(), bArray);
	}

	private setLoading(status: ELoadingStatus) {
		const toggle = status === ELoadingStatus.HIDE ? DOM.Hide : DOM.Show;
		toggle(this.Frame.Loading);
	}
}

export default Editor;