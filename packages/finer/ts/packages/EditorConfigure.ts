import { Arr, Instance, Obj, Str, Type } from '@dynafer/utils';
import { EModeEditor } from '../Options';
import DOM from './dom/DOM';
import { EToolbarStyle } from './EditorToolbar';

export type TConfigurationCallback<A, R> = ((...args: A[]) => R);
export type TConfigurationCommon<A, R> = string | string[] | TConfigurationCallback<A, R> | RegExp | undefined;
export type TConfigurationMap<A, R> = Record<string, TConfigurationCommon<A, R>>;
type TConfigurationKey<A = unknown, R = unknown> = TConfigurationCommon<A, R> | TConfigurationMap<A, R> | TConfigurationMap<A, R>[] | HTMLElement | RegExp | boolean;

export interface IEditorConfiguration {
	selector?: HTMLElement,
	mode?: string,
	width?: string,
	height?: string,
	plugins?: string[],
	toolbar?: string[],
	toolbarGroup?: Record<string, string[]>,
	toolbarStyle?: string,
	skin?: string,
	[key: string]: TConfigurationKey,
}

export interface IConfiguration {
	readonly Id: string,
	readonly Selector: HTMLElement,
	readonly Mode: EModeEditor,
	readonly Width: string,
	readonly Height: string,
	readonly Toolbar: string[],
	readonly ToolbarGroup: Record<string, string[]>,
	readonly ToolbarStyle: string,
	readonly Plugins: string[],
	readonly Skin: string,
	readonly ShowFooter: boolean,
	readonly [key: Capitalize<string>]: TConfigurationKey,
}

const Configure = (config: IEditorConfiguration): IConfiguration => {
	const defaultConfigs: string[] = ['selector', 'mode', 'width', 'height', 'plugins', 'toolbar', 'toolbarGroup', 'toolbarStyle', 'skin', 'showFooter'];

	if (!config.selector || !Instance.IsElement(config.selector)) throw new Error('Configuration: selector must be an provided.');

	const Id = DOM.Utils.CreateUEID();

	const Selector = config.selector;
	DOM.Hide(Selector);

	const mode: string = Str.LowerCase(config.mode ?? EModeEditor.classic);
	if (!Type.IsString(mode) || !EModeEditor[mode as EModeEditor])
		throw new Error(`Configuration: ${mode} mode doesn't exist.`);

	const Mode = EModeEditor[mode as EModeEditor];

	const Width = config.width ?? '100%';
	const defaultHeight = Mode === EModeEditor.classic ? '400px' : 'auto';
	const Height = config.height ?? defaultHeight;

	const Plugins: string[] = config.plugins ?? [];
	if (!Type.IsArray(Plugins)) throw new Error('Configuration: Plugins must be an array.');

	let Toolbar: string[];
	let ToolbarGroup: Record<string, string[]>;
	if (config.toolbar) {
		Toolbar = config.toolbar;
		if (!Type.IsArray(Toolbar)) throw new Error('Configuration: Toolbar must be an array.');

		ToolbarGroup = config.toolbarGroup ?? {};
		if (ToolbarGroup && !Type.IsObject(ToolbarGroup)) throw new Error('Configuration: Toolbar Group must be an object.');
	} else {
		Toolbar = ['styles', 'basic', 'script', 'font', 'color', 'alignment', 'indentation'];
		ToolbarGroup = {
			styles: ['heading_style', 'block_style'],
			font: ['fontSize', 'fontFamily'],
			basic: ['bold', 'italic', 'underline', 'strikethrough', 'code'],
			color: ['foreColor', 'backColor'],
			script: ['subscript', 'superscript'],
		};
	}

	let ToolbarStyle: string = Str.UpperCase(Type.IsString(config.toolbarStyle) ? config.toolbarStyle : EToolbarStyle.SCROLL);
	if (!EToolbarStyle[ToolbarStyle as EToolbarStyle]) ToolbarStyle = EToolbarStyle.SCROLL;

	const excludedDefaultConfiguration: Record<string, TConfigurationKey> = {};
	Obj.Entries(config, (key, value) => {
		if (Arr.Contains(defaultConfigs, key)) return;
		excludedDefaultConfiguration[Str.CapitaliseFirst(Str.UnderlineToCapital(key))] = value;
	});

	const skin = config.skin;
	const Skin = skin && Type.IsString(skin) && !Str.IsEmpty(skin) ? skin : 'simple';

	const showFooter = config.showFooter;
	const ShowFooter = showFooter && Type.IsBoolean(showFooter) ? showFooter : true;

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
		ShowFooter,
		...excludedDefaultConfiguration
	};

	Object.freeze(configuration);

	return configuration;
};

export default Configure;