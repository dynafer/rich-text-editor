import { IConfiguration } from 'finer/packages/Configuration';
import EditorDestroy from 'finer/packages/EditorDestroy';
import EditorFrame, { IEditorFrame } from 'finer/packages/EditorFrame';
import DOM from 'finer/packages/dom/DOM';
import PluginLoader from 'finer/packages/loaders/PluginLoader';
import { ENotificationStatus, INotificationManager, NotificationManager } from 'finer/packages/managers/NotificationManager';

enum ELoadingStatus {
	show,
	hide
}

class Editor {
	public Id: string;
	public Config: IConfiguration;
	public Frame: IEditorFrame;
	public Notification: INotificationManager;
	private mbDestroyed: boolean = false;

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

	public Destroy() {
		this.mbDestroyed = true;
		EditorDestroy.Destroy(this);
	}

	public IsDestroyed(): boolean {
		return this.mbDestroyed;
	}

	private setLoading(status: ELoadingStatus) {
		if (status === ELoadingStatus.hide)
			DOM.Hide(this.Frame.Loading);
		else
			DOM.Show(this.Frame.Loading);
	}

	private render(): Promise<void> {
		return new Promise((resolve, reject) => {
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
				.then(() => resolve())
				.catch(error => {
					this.Notify(ENotificationStatus.error, error);
					reject(error);
				});
		});
	}
}

export default Editor;