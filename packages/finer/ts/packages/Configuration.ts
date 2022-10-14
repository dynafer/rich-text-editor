import { IsArray } from 'dynafer/utils/Type';

const availableModes: string[] = ['classic', 'inline'];

export type TConfiguration = HTMLElement | string[] | string;

export interface IConfiguration {
	selector: HTMLElement,
	mode: string,
	width: string,
	height: string,
	plugins: string[],
}

const SetDefaultToConfig = (config: Record<string, TConfiguration>): IConfiguration => {
	if (!config.selector || !(config.selector instanceof Element)) {
		throw new Error('Selector of configuration must be provided');
	}

	const selector: HTMLElement = config.selector as HTMLElement;

	const mode: string = (config.mode as string ?? 'classic').toLowerCase();
	if (!availableModes.includes(mode)) {
		throw new Error(`${mode} mode doesn't exist`);
	}

	const width: string = config.width as string ?? '100%';
	const defaultHeight: string = mode === 'classic' ? '400px' : 'auto';
	const height: string = config.height as string ?? defaultHeight;

	const plugins: string[] = config.plugins as string[] ?? [];
	if (!IsArray(plugins)) {
		throw new Error('Plugins of configuration must be array');
	}

	const configuration: IConfiguration = {
		selector: selector,
		mode: mode,
		width: width,
		height: height,
		plugins: plugins
	};

	return configuration;
};

export default SetDefaultToConfig;