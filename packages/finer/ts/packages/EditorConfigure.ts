import { Instance, Str, Type } from '@dynafer/utils';
import { EModeEditor } from '../Options';
import DOM from './dom/DOM';
import { IFormatConfiguration } from './formatter/FormatType';

export interface IEditorOption {
	selector?: HTMLElement,
	mode?: string,
	width?: string,
	height?: string,
	plugins?: string[],
	toolbars?: string[],
	skin?: string,
	[key: string]: string | string[] | Record<string, string> | HTMLElement | undefined,
}

export interface IConfiguration extends IFormatConfiguration {
	Id: string,
	Selector: HTMLElement,
	Mode: EModeEditor,
	Width: string,
	Height: string,
	Toolbars: string[],
	Plugins: string[],
	Skin: string,
	[key: string]: string | string[] | Record<string, string> | HTMLElement | undefined,
}

const Configure = (config: IEditorOption): IConfiguration => {
	const defaultConfigs: string[] = ['selector', 'mode', 'width', 'height', 'plugins', 'toolbars', 'skin'];

	if (!config.selector || !Instance.IsElement(config.selector)) {
		throw new Error('Configuration: selector of configuration must be provided');
	}

	const Id: string = DOM.Utils.CreateUEID();

	const Selector: HTMLElement = config.selector;
	DOM.Hide(Selector);

	const mode: string = (config.mode ?? EModeEditor.classic).toLowerCase();
	if (!Type.IsString(mode) || !EModeEditor[mode]) {
		throw new Error(`Configuration: ${mode} mode doesn't exist`);
	}

	const Mode: EModeEditor = EModeEditor[mode] as EModeEditor;

	const Width: string = config.width ?? '100%';
	const defaultHeight: string = Mode === EModeEditor.classic ? '400px' : 'auto';
	const Height: string = config.height ?? defaultHeight;

	const Plugins: string[] = config.plugins ?? [];
	if (!Type.IsArray(Plugins)) {
		throw new Error('Configuration: Plugins of configuration must be array');
	}

	const Toolbars: string[] = config.toolbars ?? [];
	if (!Type.IsArray(Toolbars)) {
		throw new Error('Configuration: Toolbars of configuration must be array');
	}

	const excludedDefaultOption = {};
	for (const [key, value] of Object.entries(config)) {
		if (defaultConfigs.includes(key)) continue;
		excludedDefaultOption[key] = value;
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
		Toolbars,
		Skin,
		...excludedDefaultOption
	};

	Object.freeze(configuration);

	return configuration;
};

export default Configure;