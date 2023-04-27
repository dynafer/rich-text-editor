import { NodeType } from '@dynafer/dom-control';
import { Arr, Obj, Str, Type } from '@dynafer/utils';
import { EEditorMode } from '../Options';
import DOM from './dom/DOM';
import { EToolbarStyle } from './EditorToolbar';

export type TConfigurationCallback<A, R> = ((...args: A[]) => R);
export type TConfigurationCommon<A, R> = string | string[] | TConfigurationCallback<A, R> | RegExp | undefined;
export type TConfigurationMap<A, R> = Record<string, TConfigurationCommon<A, R>>;
export type TConfigurationKey<A = unknown, R = unknown> = TConfigurationCommon<A, R> | TConfigurationMap<A, R> | TConfigurationMap<A, R>[] | HTMLElement | RegExp | boolean;

export type TConfigurationResizable = 'horizontal' | 'vertical' | 'all';

export interface IConfiguration {
	readonly Selector: HTMLElement,
	readonly Mode: EEditorMode,
	readonly Width: string,
	readonly Height: string,
	readonly Toolbar: string[],
	readonly ToolbarGroup: Record<string, string[]>,
	readonly ToolbarStyle: string,
	readonly Plugins: string[],
	readonly Skin: string,
	readonly ShowFooter: boolean,
	readonly Resizable: TConfigurationResizable,
	readonly [key: Capitalize<string>]: TConfigurationKey,
}

const Configure = (config: Record<string, TConfigurationKey>): IConfiguration => {
	const DEFAULT_CONFIGS: string[] = ['selector', 'mode', 'width', 'height', 'plugins', 'toolbar', 'toolbarGroup', 'toolbarStyle', 'skin', 'showFooter', 'resizable'];

	if (!config.selector || !NodeType.IsElement(config.selector)) throw new Error('Configuration: selector must be an provided.');

	const Selector = config.selector;
	DOM.Hide(Selector);

	const mode = Str.LowerCase(config.mode as string ?? EEditorMode.classic);
	if (!Type.IsString(mode) || !EEditorMode[mode as EEditorMode])
		throw new Error(`Configuration: ${mode} mode doesn't exist.`);

	const Mode = EEditorMode[mode as EEditorMode];

	const Width = config.width as string ?? '100%';
	const defaultHeight = Mode === EEditorMode.classic ? '400px' : 'auto';
	const Height = config.height as string ?? defaultHeight;

	const Plugins = config.plugins as string[] ?? [];
	if (!Type.IsArray(Plugins)) throw new Error('Configuration: Plugins must be an array.');

	let Toolbar = config.toolbar as string[];
	let ToolbarGroup: Record<string, string[]>;
	if (Toolbar) {
		if (!Type.IsArray(Toolbar)) throw new Error('Configuration: Toolbar must be an array.');

		ToolbarGroup = config.toolbarGroup as Record<string, string[]> ?? {};
		if (ToolbarGroup && !Type.IsObject(ToolbarGroup)) throw new Error('Configuration: Toolbar Group must be an object.');
	} else {
		Toolbar = ['styles', 'history', 'basic', 'script', 'font', 'color', 'alignment', 'indentation', 'info'];
		ToolbarGroup = {
			styles: ['heading_style', 'block_style'],
			history: ['undo', 'redo'],
			font: ['fontSize', 'fontFamily'],
			basic: ['bold', 'italic', 'underline', 'strikethrough', 'code'],
			color: ['foreColor', 'backColor'],
			script: ['subscript', 'superscript'],
		};
	}

	let ToolbarStyle: string = Str.UpperCase(Type.IsString(config.toolbarStyle) ? config.toolbarStyle : EToolbarStyle.SCROLL);
	if (!EToolbarStyle[ToolbarStyle as EToolbarStyle]) ToolbarStyle = EToolbarStyle.SCROLL;

	const otherConfigurations: Record<string, TConfigurationKey> = {};
	Obj.Entries(config, (key, value) => {
		if (Arr.Contains(DEFAULT_CONFIGS, key)) return;
		otherConfigurations[Str.CapitaliseFirst(Str.UnderlineToCapital(key))] = value;
	});

	const skin = config.skin;
	const Skin = skin && Type.IsString(skin) && !Str.IsEmpty(skin) ? skin : 'simple';

	const showFooter = config.showFooter;
	const ShowFooter = Type.IsBoolean(showFooter) ? showFooter : true;

	const resizable = config.resizable;
	const Resizable = Mode !== EEditorMode.inline && Type.IsString(resizable) && Arr.Contains(['horizontal', 'vertical', 'all'], resizable)
		? resizable as TConfigurationResizable
		: 'vertical';

	const configuration: IConfiguration = {
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
		Resizable,
		...otherConfigurations
	};

	Object.freeze(configuration);

	return configuration;
};

export default Configure;