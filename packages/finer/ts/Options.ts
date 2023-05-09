import { Arr, Str } from '@dynafer/utils';

let projectURL: string = document.baseURI;

const dumpURL = projectURL.split('/');
projectURL = dumpURL.slice(0, dumpURL.length - 1).join('/');
Arr.Clean(dumpURL);

Arr.Each(document.head.querySelectorAll('script'), (loadedScript, exit) => {
	if (!Str.Contains(loadedScript.src, 'finer.')) return;
	const tempSrc = loadedScript.src.split('/');
	projectURL = tempSrc.slice(0, tempSrc.length - 1).join('/');
	if (Str.IsEmpty(projectURL)) projectURL = '.';
	Arr.Clean(tempSrc);
	exit();
});

export enum EEditorMode {
	classic = 'classic',
	inline = 'inline',
}

export interface IOptions {
	readonly PROJECT_NAME: string,
	readonly SHORT_NAME: string,
	readonly ATTRIBUTES: Readonly<Record<Uppercase<string>, string>>,
	readonly URLS: Record<string, string>,
	JoinURL: (type: string, name: string) => string,
	GetModeTag: (mode: EEditorMode) => string,
}

const Options = (): IOptions => {
	const PROJECT_NAME = 'finer-editor';
	const SHORT_NAME = 'finer';

	const ATTRIBUTES: Record<string, string> = {};

	const addAttributeNames = (...names: string[]) => Arr.WhileShift(names, name => {
		ATTRIBUTES[Str.UpperCase(name).replace(/-/g, '_')] = Str.Merge(SHORT_NAME, '-', name);
	});

	addAttributeNames(
		'adjustable-edge',
		'adjustable-edge-group',
		'adjustable-line',
		'adjustable-line-group',
		'adjusting',
		'as-text',
		'fake',
		'fixed',
		'focused',
		'icon',
		'horizontal',
		'movable',
		'original-height',
		'original-width',
		'parts-menu',
		'remove',
		'selected',
		'style',
		'type',
		'vertical',
	);

	const URL_PREFIX: string = new URL(projectURL).href;

	const URLS: Record<string, string> = {
		PREFIX: URL_PREFIX,
		CSS: `${URL_PREFIX}`,
		PLUGIN: `${URL_PREFIX}/plugins`,
		ICON: `${URL_PREFIX}/icons`,
		LANGUAGE: `${URL_PREFIX}/langs`,
	};

	const JoinURL = (type: string, name: string): string => {
		switch (type) {
			case 'css':
				if (!Str.Contains(name, '.css')) name = `${name}.min.css`;
				return `${URLS.CSS}/${name}`;
			case 'plugin':
				if (!Str.Contains(name, '.js')) name = `${name}/${name}.min.js`;
				return `${URLS.PLUGIN}/${name}`;
			case 'icon':
				if (!Str.Contains(name, '.js')) name = `${name}/icons.min.js`;
				return `${URLS.ICON}/${name}`;
			case 'language':
				if (!Str.Contains(name, '.js')) name = `${name}.js`;
				return `${URLS.LANGUAGE}/${name}`;
			default:
				return `${URLS.PREFIX}/${name}`;
		}
	};

	const GetModeTag = (mode: EEditorMode): string => {
		switch (mode) {
			case EEditorMode.inline:
				return 'div';
			case EEditorMode.classic:
			default:
				return 'iframe';
		}
	};

	return {
		PROJECT_NAME,
		SHORT_NAME,
		ATTRIBUTES,
		URLS,
		JoinURL,
		GetModeTag,
	};
};

export default Options();