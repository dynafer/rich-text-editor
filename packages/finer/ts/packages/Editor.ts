import { Type } from 'dynafer/utils';
import { IConfiguration } from 'finer/packages/Configuration';
import EditorDestroy from 'finer/packages/EditorDestroy';
import EditorFrame, { IEditorFrame } from 'finer/packages/EditorFrame';
import DOM, { IDom, TEventListener } from 'finer/packages/dom/DOM';
import PluginLoader from 'finer/packages/loaders/PluginLoader';
import { Caret } from 'finer/packages/caret/Caret';
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
	public Caret!: Caret;

	private mbDestroyed: boolean = false;
	private mbIframe: boolean = false;

	public constructor(config: IConfiguration) {
		this.Id = config.Id;
		this.Config = config;
		this.Frame = EditorFrame(config);
		this.Notification = NotificationManager(this);

		this.render()
			.then(() => {
				this.setLoading(ELoadingStatus.hide);
			})
			.catch(error => {
				this.Notify(ENotificationStatus.error, error);
			});
	}

	public AddToolbar(toolbar: HTMLElement) {
		DOM.Insert(this.Frame.Toolbar, toolbar);
	}

	public Notify(type: ENotificationStatus, text: string) {
		this.Notification.Dispatch(type, text);
	}

	public On<K extends keyof GlobalEventHandlersEventMap>(eventName: K, event: TEventListener<K>): void;
	public On(eventName: string, event: EventListener) {
		if (!DOM.Utils.NativeEvents.includes(eventName)) eventName = `Editor:${eventName}`;
		this.DOM.On(this.GetBody(), eventName, event);
	}

	public Dispatch(eventName: string) {
		if (!DOM.Utils.NativeEvents.includes(eventName)) eventName = `Editor:${eventName}`;
		this.DOM.Dispatch(this.GetBody(), eventName);
	}

	public Destroy() {
		this.mbDestroyed = true;
		EditorDestroy.Destroy(this);
	}

	public IsDestroyed(): boolean {
		return this.mbDestroyed;
	}

	public GetBody(): HTMLElement {
		return this.mbIframe ? this.DOM.Doc.body : this.Frame.Container;
	}

	private setLoading(status: ELoadingStatus) {
		if (status === ELoadingStatus.hide)
			DOM.Hide(this.Frame.Loading);
		else
			DOM.Show(this.Frame.Loading);
	}

	private render(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (Type.IsInstance(this.Frame.Container, HTMLIFrameElement)) {
				this.mbIframe = true;
				this.DOM = DOM.New(
					this.Frame.Container.contentWindow as Window & typeof globalThis,
					this.Frame.Container.contentDocument as Document
				);

				this.DOM.SetAttr(this.DOM.Doc.body, 'contenteditable', 'true');
			}

			this.Caret = new Caret(this);

			const attachPlugins: Promise<void>[] = [];
			for (const name of this.Config.Plugins) {
				if (!PluginLoader.Has(name)) {
					this.Notify(ENotificationStatus.warning, `Plugin '${name}' hasn't loaded.`);
					continue;
				}

				attachPlugins.push(finer.Managers.Plugin.Attach(this, name));
			}

			DOM.Hide(this.Config.Selector);

			Promise.all(attachPlugins)
				.then(() => {
					return resolve();
				})
				.catch(error => {
					this.Notify(ENotificationStatus.error, error);
					reject(error);
				});
		});
	}
}

export default Editor;