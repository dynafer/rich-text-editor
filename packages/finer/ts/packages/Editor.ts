import { Utils, Type } from 'dynafer/utils';
import { EModeEditor, IConfiguration } from 'finer/packages/Configuration';
import EditorFrame, { IEditorFrame } from 'finer/packages/EditorFrame';
import DOM, { IDom } from 'finer/packages/dom/DOM';
import PluginLoader from 'finer/packages/loaders/PluginLoader';
import { ENotificationStatus, INotificationManager, NotificationManager } from 'finer/packages/managers/NotificationManager';
import Options from '../Options';

class Editor {
	public Id: string;
	public Config: IConfiguration;
	public DOM: IDom = DOM;
	public Frame: IEditorFrame;
	public Notification: INotificationManager;

	public constructor(config: IConfiguration) {
		this.Id = this.CreateUEID();
		this.Config = config;

		this.Frame = EditorFrame(this);

		this.Notification = NotificationManager(this);

		this.render();
	}

	public AddToolbar(toolbar: HTMLElement) {
		this.DOM.Insert(this.Frame.Toolbar, toolbar);
	}

	public GetModeTag() {
		switch (this.Config.Mode) {
			case EModeEditor.inline:
				return 'div';
			case EModeEditor.classic:
			default:
				return 'iframe';
		}
	}

	public CreateUEID(id: string = '', addNumber: boolean = true): string {
		id = Type.IsEmpty(id) ? Options.ProjectName : `${Options.ProjectName}-${id}`;
		return Utils.CreateUEID(id, addNumber);
	}

	public Dispatch(type: ENotificationStatus, text: string) {
		this.Notification.Dispatch(type, text);
	}

	private render() {
		this.loadPlugins();

		DOM.SetStyle(this.Config.Selector, 'display', 'none');
	}

	private loadPlugins() {
		for (const name of this.Config.Plugins) {
			if (!PluginLoader.Has(name)) {
				this.Dispatch(ENotificationStatus.warning, `Plugin: ${name} hasn't loaded`);
			}

			finer.Managers.Plugin.Attach(this, name);
		}
	}
}

export default Editor;