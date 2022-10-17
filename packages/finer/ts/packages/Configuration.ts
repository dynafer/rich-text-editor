import { Type } from 'dynafer/utils';

export enum EModeEditor {
	classic,
	inline
}

export type TConfiguration = HTMLElement | string[] | string;

export interface IConfiguration {
	Selector: HTMLElement,
	Mode: EModeEditor,
	Width: string,
	Height: string,
	Toolbars: string[],
	Plugins: string[],
}

const SetDefaultToConfig = (config: Record<string, TConfiguration>): IConfiguration => {
	if (!config.selector || !Type.IsElement(config.selector)) {
		throw new Error('Configuration: selector of configuration must be provided');
	}

	const Selector: HTMLElement = config.selector as HTMLElement;

	const mode: string = (config.mode as string ?? EModeEditor[EModeEditor.classic]).toLowerCase();
	if (!EModeEditor[EModeEditor[mode]]) {
		throw new Error(`Configuration: ${mode} mode doesn't exist`);
	}

	const Mode = EModeEditor[mode];

	const Width: string = config.width as string ?? '100%';
	const defaultHeight: string = Mode === EModeEditor.classic ? '400px' : 'auto';
	const Height: string = config.height as string ?? defaultHeight;

	const Plugins: string[] = config.plugins as string[] ?? [];
	if (!Type.IsArray(Plugins)) {
		throw new Error('Configuration: Plugins of configuration must be array');
	}

	const Toolbars: string[] = config.toolbars as string[] ?? [];
	if (!Type.IsArray(Toolbars)) {
		throw new Error('Configuration: Toolbars of configuration must be array');
	}

	for (const toolbar of Toolbars) {
		if (Plugins.includes(toolbar)) continue;

		Plugins.push(toolbar);
	}

	const configuration: IConfiguration = {
		Selector,
		Mode,
		Width,
		Height,
		Plugins,
		Toolbars,
	};

	Object.freeze(configuration);

	return configuration;
};

export default SetDefaultToConfig;