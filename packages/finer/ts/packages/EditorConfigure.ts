import { Arr, Instance, Str, Type } from '@dynafer/utils';
import { EModeEditor } from '../Options';
import DOM from './dom/DOM';
import { EToolbarStyle } from './EditorToolbar';
export interface IEditorOption {
	selector?: HTMLElement,
	mode?: string,
	width?: string,
	height?: string,
	plugins?: string[],
	toolbar?: string[],
	toolbarGroup?: Record<string, string[]>,
	toolbarStyle?: string,
	skin?: string,
	[key: string]: string | string[] | Record<string, string> | Record<string, string[]> | HTMLElement | undefined,
}

export interface IConfiguration {
	Id: string,
	Selector: HTMLElement,
	Mode: EModeEditor,
	Width: string,
	Height: string,
	Toolbar: string[],
	ToolbarGroup: Record<string, string[]>,
	ToolbarStyle: string,
	Plugins: string[],
	Skin: string,
	[key: string]: string | string[] | Record<string, string> | Record<string, string[]> | HTMLElement | undefined,
}

const Configure = (config: IEditorOption): IConfiguration => {
	const defaultConfigs: string[] = ['selector', 'mode', 'width', 'height', 'plugins', 'toolbar', 'toolbarGroup', 'toolbarStyle', 'skin'];

	if (!config.selector || !Instance.IsElement(config.selector)) {
		throw new Error('Configuration: selector must be an provided.');
	}

	const Id: string = DOM.Utils.CreateUEID();

	const Selector: HTMLElement = config.selector;
	DOM.Hide(Selector);

	const mode: string = Str.LowerCase(config.mode ?? EModeEditor.classic);
	if (!Type.IsString(mode) || !EModeEditor[mode]) {
		throw new Error(`Configuration: ${mode} mode doesn't exist.`);
	}

	const Mode: EModeEditor = EModeEditor[mode] as EModeEditor;

	const Width: string = config.width ?? '100%';
	const defaultHeight: string = Mode === EModeEditor.classic ? '400px' : 'auto';
	const Height: string = config.height ?? defaultHeight;

	const Plugins: string[] = config.plugins ?? [];
	if (!Type.IsArray(Plugins)) {
		throw new Error('Configuration: Plugins must be an array.');
	}

	let Toolbar: string[];
	let ToolbarGroup: Record<string, string[]>;
	if (config.toolbar) {
		Toolbar = config.toolbar;
		if (!Type.IsArray(Toolbar)) {
			throw new Error('Configuration: Toolbar must be an array.');
		}

		ToolbarGroup = config.toolbarGroup ?? {};
		if (ToolbarGroup && !Type.IsObject(ToolbarGroup)) {
			throw new Error('Configuration: Toolbar Group must be an object.');
		}
	} else {
		Toolbar = ['styles', 'basic', 'script', 'font', 'color', 'alignment', 'indentation'];
		ToolbarGroup = {
			styles: ['heading_style', 'block_style'],
			font: ['fontSize', 'fontFamily'],
			basic: ['bold', 'italic', 'underline', 'strikethrough', 'code'],
			color: ['foreColor', 'backColor'],
			script: ['subscript', 'superscript'],
			lists: ['numberList', 'bulletList'],
		};
	}

	let ToolbarStyle: string = Str.UpperCase(Type.IsString(config.toolbarStyle) ? config.toolbarStyle : EToolbarStyle.SCROLL);
	if (!EToolbarStyle[ToolbarStyle]) ToolbarStyle = EToolbarStyle.SCROLL;

	const excludedDefaultOption = {};
	for (const [key, value] of Object.entries(config)) {
		if (Arr.Contains(defaultConfigs, key)) continue;
		excludedDefaultOption[Str.CapitaliseFirst(Str.UnderlineToCapital(key))] = value;
	}

	const skin = config.skin;
	const Skin = skin && Type.IsString(skin) && !Str.IsEmpty(skin) ? skin : 'simple';

	const configuration: IConfiguration = {
		Id,
		Selector,
		Mode,
		Width,
		Height,
		Plugins,
		Toolbar,
		ToolbarGroup,
		ToolbarStyle,
		Skin,
		...excludedDefaultOption
	};

	Object.freeze(configuration);

	return configuration;
};

export default Configure;