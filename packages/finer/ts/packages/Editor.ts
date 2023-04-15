import { Arr, Str } from '@dynafer/utils';
import Options from '..//Options';
import Commander, { ICommander } from './commander/Commander';
import DOM, { IDom, TEventListener } from './dom/DOM';
import { IDOMTools } from './dom/DOMTools';
import Configure, { IConfiguration, IEditorConfiguration } from './EditorConfigure';
import EditorDestroy from './EditorDestroy';
import EditorFrame, { IEditorFrame } from './EditorFrame';
import EditorSetup from './EditorSetup';
import EditorToolbar, { IEditorToolbar } from './EditorToolbar';
import EditorUtils, { IEditorUtils } from './editorUtils/EditorUtils';
import { IEvent } from './editorUtils/EventUtils';
import { ENativeEvents } from './events/EventSetupUtils';
import { IFormatter } from './formatter/Formatter';
import { IHistoryManager } from './history/HistoryManager';
import HistorySetup from './history/Setup';
import { IFooterManager } from './managers/FooterManager';
import { ENotificationStatus, INotificationManager, NotificationManager } from './managers/NotificationManager';
import { IPluginManager } from './managers/PluginManager';
import { IShortcuts } from './toolbars/Types';

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
	public readonly History: IHistoryManager;
	public readonly Notification: INotificationManager;
	public readonly Commander: ICommander;
	public readonly Toolbar: IEditorToolbar;
	public readonly Utils: IEditorUtils;
	public DOM!: IDom;
	public Footer!: IFooterManager | null;
	public Formatter!: IFormatter;
	public Plugin!: IPluginManager;
	public Tools!: IEditorTools;

	private readonly mShortcuts: IShortcuts[] = [];
	private mWin: Window & typeof globalThis = window;
	private mBody!: HTMLElement;
	private mScrollX: number = -1;
	private mScrollY: number = -1;
	private mbDestroyed: boolean = false;
	private mbAdjusting: boolean = false;

	public constructor(config: IEditorConfiguration) {
		const configuration: IConfiguration = Configure(config);

		this.Id = configuration.Id;
		this.Config = configuration;
		this.Frame = EditorFrame(configuration);
		this.Utils = EditorUtils(this);
		this.Commander = Commander(this);
		this.History = HistorySetup(this);
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

	public IsDestroyed(): boolean { return this.mbDestroyed; }

	public IsAdjusting(): boolean { return this.mbAdjusting; }
	public SetAdjusting(bAdjusting: boolean) { this.mbAdjusting = bAdjusting; }

	public IsIFrame(): boolean {
		return DOM.Utils.IsIFrame(this.Frame.Container);
	}

	// body getter and setter
	public SetBody(body: HTMLElement) { this.mBody = body; }
	public GetBody(): HTMLElement { return this.mBody; }

	public SetWin(win: Window) { this.mWin = win as Window & typeof globalThis ?? window; }
	public GetWin(): Window & typeof globalThis { return this.mWin; }
	public GetRootWin(): Window & typeof globalThis { return window; }

	public GetRootDOM(): IDom { return DOM; }

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

	public Scroll(target: HTMLElement, duration: number = 800) {
		const start = this.DOM.GetRoot().scrollTop;
		const rect = this.DOM.GetRect(target);
		const targetTop = rect?.top ?? target.offsetTop;
		const targetHeight = rect?.height ?? target.offsetHeight;
		const halfHeights = (this.GetWin().innerHeight / 2) - (targetHeight / 2);
		const distance = targetTop - halfHeights;

		let startTime: number | null = null;

		const easeInOutQuad = (progress: number): number => {
			const normalisedTime = progress / (duration / 2);
			if (normalisedTime < 1) return 0.5 * normalisedTime * normalisedTime;
			const adjustedTime = normalisedTime - 1;
			return -0.5 * (adjustedTime * (adjustedTime - 2) - 1);
		};

		const animate = (currentTime: number) => {
			if (startTime === null) startTime = currentTime;
			const elapsedTime = currentTime - startTime;
			const progress = easeInOutQuad(elapsedTime);
			const scrollToPosition = start + distance * progress;
			this.GetWin().scrollTo(0, scrollToPosition);

			if (elapsedTime < duration) return this.GetWin().requestAnimationFrame(animate);
		};

		this.GetWin().requestAnimationFrame(animate);
	}

	public Focus() {
		this.SaveScrollPosition();
		const caret = this.Utils.Caret.Get();
		let copiedRange = caret?.Range.Clone() ?? null;

		const cells = DOM.Element.Table.GetSelectedCells(this);
		if (!Arr.IsEmpty(cells)) return this.ScrollSavedPosition();

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

	public IsFocused(): boolean { return DOM.HasClass(this.Frame.Container, 'focused'); }

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

	public GetContent(): string {
		const fake = DOM.Create('div');
		DOM.CloneAndInsert(fake, true, ...this.GetLines());
		Arr.WhileShift(DOM.SelectAll({ attrs: { dataFixed: 'dom-tool' } }, fake), tools => DOM.Remove(tools));
		Arr.WhileShift(DOM.SelectAll({ attrs: [Options.ATTRIBUTE_EDITOR_STYLE] }, fake), styleElems => DOM.RemoveAttr(styleElems, Options.ATTRIBUTE_EDITOR_STYLE));
		const html = DOM.GetHTML(fake);
		DOM.Remove(fake);
		return html;
	}

	public GetLines(bArray?: true): Element[];
	public GetLines(bArray: false): HTMLCollection;
	public GetLines<T extends boolean>(bArray: T | true = true): T extends true ? Element[] : HTMLCollection {
		return this.DOM.GetChildren(this.GetBody(), bArray);
	}

	public CleanDirty() {
		const lines = this.GetLines(true);
		Arr.WhileShift(lines, line => this.Formatter.Utils.CleanDirty(this, this.DOM.GetChildNodes(line)));
	}

	public AddShortcut(title: string, keys: string) {
		for (let index = 0, length = this.mShortcuts.length; index < length; ++index) {
			if (Str.LowerCase(this.mShortcuts[index].Title) === Str.LowerCase(title)) return;
		}

		Arr.Push(this.mShortcuts, {
			Title: title,
			Keys: keys,
		});
	}

	public GetShortcuts(): IShortcuts[] {
		return this.mShortcuts;
	}

	private setLoading(status: ELoadingStatus) {
		const toggle = status === ELoadingStatus.HIDE ? DOM.Hide : DOM.Show;
		toggle(this.Frame.Loading);
	}
}

export default Editor;