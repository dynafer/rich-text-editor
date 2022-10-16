import { Type } from 'dynafer/utils';

const availableModes: string[] = ['classic', 'inline'];

export type TConfiguration = HTMLElement | string[] | string;

export interface IConfiguration {
	selector: HTMLElement,
	mode: string,
	width: string,
	height: string,
	toolbars: string[],
	plugins: string[],
}

const SetDefaultToConfig = (config: Record<string, TConfiguration>): IConfiguration => {
	if (!config.selector || !Type.IsElement(config.selector)) {
		throw new Error('Configuration: selector of configuration must be provided');
	}

	const selector: HTMLElement = config.selector as HTMLElement;

	const mode: string = (config.mode as string ?? 'classic').toLowerCase();
	if (!availableModes.includes(mode)) {
		throw new Error(`Configuration: ${mode} mode doesn't exist`);
	}

	const width: string = config.width as string ?? '100%';
	const defaultHeight: string = mode === 'classic' ? '400px' : 'auto';
	const height: string = config.height as string ?? defaultHeight;

	const plugins: string[] = config.plugins as string[] ?? [];
	if (!Type.IsArray(plugins)) {
		throw new Error('Configuration: Plugins of configuration must be array');
	}

	const toolbars: string[] = config.toolbars as string[] ?? [];
	if (!Type.IsArray(toolbars)) {
		throw new Error('Configuration: Toolbars of configuration must be array');
	}
	for (const toolbar of toolbars) {
		if (plugins.includes(toolbar)) continue;

		plugins.push(toolbar);
	}

	const configuration: IConfiguration = {
		selector: selector,
		mode: mode,
		width: width,
		height: height,
		plugins: plugins,
		toolbars: toolbars,
	};

	return configuration;
};

export default SetDefaultToConfig;