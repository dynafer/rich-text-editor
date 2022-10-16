import { Utils } from 'dynafer/utils';
import { IConfiguration } from './Configuration';
import EditorFrame, { IEditorFrame } from './EditorFrame';
import DOM, { IDom } from 'finer/packages/dom/DOM';

class Editor {
	public id: string;
	public selector: HTMLElement;
	public dom: IDom;
	public mode: string;
	public width: string;
	public height: string;
	public frame: IEditorFrame;
	public plugins: string[];
	public toolbars: string[];

	public constructor(config: IConfiguration) {
		this.id = Utils.CreateUEID();
		this.selector = config.selector;
		this.dom = DOM;
		this.mode = config.mode;
		this.width = config.width;
		this.height = config.height;
		this.plugins = config.plugins;
		this.toolbars = config.toolbars;

		this.frame = EditorFrame(this);

		this.render();
	}

	private render() {
		DOM.SetStyle(this.selector, 'display', 'none');

		this.loadPlugins();
	}

	private loadPlugins() {
		for (const name of this.plugins) {
			if (!finer.loaders.plugin.Has(name)) throw new Error(`Plugin: ${name} hasn't loaded`);

			finer.managers.plugin.Load(this, name);
		}
	}

	public AddToolbar() {

	}

	public GetModeTag() {
		switch (this.mode) {
			case 'inline':
				return 'div';
			case 'classic':
			default:
				return 'iframe';
		}
	}
}

export default Editor;