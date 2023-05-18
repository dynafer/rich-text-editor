import { Arr, Obj, Str, Type, UID } from '@dynafer/utils';
import Options from '..//Options';
import Commander, { ICommander } from './commander/Commander';
import DOM, { IDom, TEventListener } from './dom/DOM';
import { IConfiguration } from './EditorConfigure';
import EditorDestroy from './EditorDestroy';
import EditorFrame, { IEditorFrame } from './EditorFrame';
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
import { IPartsTool } from './tools/Parts';
import { IResizerTool } from './tools/Resizer';
import { IResizeOption } from './tools/types/ResizerType';

interface IEditorTools {
	readonly Parts: IPartsTool,
	readonly Resizer: IResizerTool,
}

export enum ELoadingStatus {
	SHOW = 'SHOW',
	HIDE = 'HIDE'
}

class Editor {
	public readonly Id: string = UID.CreateUUID();
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
	private mbAdjusting: boolean = false;
	private mbDestroyed: boolean = false;
	private mbReadOnly: boolean = false;

	public constructor(config: IConfiguration) {
		this.Config = config;

		this.Frame = EditorFrame(config);
		this.Utils = EditorUtils(this);
		this.Commander = Commander(this);
		this.History = HistorySetup(this);
		this.Notification = NotificationManager(this);
		this.Toolbar = EditorToolbar(this);
	}

	public Notify(type: ENotificationStatus, text: string, bDestroy?: boolean) {
		this.Notification.Dispatch(type, text, bDestroy);
	}

	public On<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>, bFirst?: boolean): void;
	public On(eventName: string, event: IEvent, bFirst?: boolean): void;
	public On<T = unknown>(eventName: string, event: IEvent<T>, bFirst?: boolean): void;
	public On(eventName: string, event: IEvent, bFirst: boolean = false) {
		this.Utils.Event.On(eventName, event, bFirst);
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

	// adjusting getter and setter
	public IsAdjusting(): boolean { return this.mbAdjusting; }
	public SetAdjusting(bAdjusting: boolean) { this.mbAdjusting = bAdjusting; }

	// destroyed getter
	public IsDestroyed(): boolean { return this.mbDestroyed; }
	public Destroy() {
		this.mbDestroyed = true;
		EditorDestroy.Destroy(this);
	}

	// readonly getter and setter
	public IsReadOnly(): boolean { return this.mbReadOnly; }
	public SetReadOnly(bReadOnly: boolean) {
		const editables = [
			this.GetBody(),
			...this.DOM.SelectAll({
				attrs: { contenteditable: bReadOnly ? 'true' : 'false' }
			})
		];

		Arr.WhileShift(editables, editable => {
			if (DOM.Element.Figure.Is(editable)) return;
			DOM.SetAttr(editable, 'contenteditable', bReadOnly ? 'false' : 'true');
		});

		if (bReadOnly) {
			DOM.Element.Table.ToggleSelectMultipleCells(false, DOM.Element.Table.GetSelectedCells(this));
			this.Tools.Parts.UnsetAllFocused();
			this.Footer?.CleanNavigation();
		}

		Arr.WhileShift(DOM.SelectAll<HTMLElement>('button', this.Frame.Toolbar), formatters =>
			this.Formatter.UI.ToggleDisable(formatters, bReadOnly)
		);

		this.mbReadOnly = bReadOnly;
		if (bReadOnly) return this.Utils.Caret.CleanRanges();

		const newRange = this.Utils.Range();
		const firstChild = DOM.Utils.GetFirstChild(this.GetBody());
		if (firstChild) newRange.SetStartToEnd(firstChild, 0, 0);
		this.Utils.Caret.UpdateRange(newRange);
		this.Utils.Shared.DispatchCaretChange();
	}

	public IsIFrame(): boolean {
		return DOM.Utils.IsIFrame(this.Frame.Container);
	}

	// body getter and setter
	public SetBody(body: HTMLElement) { this.mBody = body; }
	public GetBody(): HTMLElement { return this.mBody; }

	// window getter and setter
	public SetWin(win: Window) { this.mWin = win as Window & typeof globalThis ?? window; }
	public GetWin(): Window & typeof globalThis { return this.mWin; }

	// scrollX and scrollY getter and setter
	public SaveScrollPosition() {
		const root = this.DOM.GetRoot();

		this.mScrollX = Type.IsNumber(root.scrollLeft) ? root.scrollLeft : -1;
		this.mScrollY = Type.IsNumber(root.scrollTop) ? root.scrollTop : -1;
	}
	public ScrollSavedPosition() {
		const root = this.DOM.GetRoot();

		if (this.mScrollX !== -1) root.scroll?.({ left: this.mScrollX });
		if (this.mScrollY !== -1) root.scroll?.({ top: this.mScrollY });

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

	// focused getter
	public IsFocused(): boolean { return DOM.HasClass(this.Frame.Container, 'focused'); }
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

	public CreateEmptyParagraph(): HTMLElement {
		return this.DOM.Create('p', {
			html: '<br>'
		});
	}

	// content getter and setter
	public SetContent(html: string = '<p><br></p>') {
		this.DOM.SetHTML(this.GetBody(), Str.IsEmpty(html) ? '<p><br></p>' : html);
	}
	public InitContent() { this.SetContent(); }
	public GetContent(): string {
		const fake = DOM.Create('div');
		DOM.CloneAndInsert(fake, true, ...this.GetLines());
		Arr.WhileShift(this.Tools.Parts.Manager.SelectParts(true, fake), parts => DOM.Remove(parts));
		Arr.WhileShift(DOM.SelectAll({ attrs: [Options.ATTRIBUTES.STYLE] }, fake), styleElems => DOM.RemoveAttr(styleElems, Options.ATTRIBUTES.STYLE));
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

	public Resize(opts: IResizeOption) {
		this.Tools.Resizer.Resize(opts);
	}

	public Lang(key: string, defaultText: string, replacers?: string[]): string {
		let text = Finer.ILC.Get(this.Config.Language as string, key) ?? defaultText;
		if (!Type.IsArray(replacers)) return text;

		Obj.Entries(replacers, (index, replacer) => {
			if (!Type.IsString(replacer)) return;
			text = text.replace(`{${index}}`, replacer);
		});

		return text;
	}

	public ToggleLoading(status: ELoadingStatus) {
		const toggle = status === ELoadingStatus.HIDE ? DOM.Hide : DOM.Show;
		toggle(this.Frame.Loading);
	}
}

export default Editor;