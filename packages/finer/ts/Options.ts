import { Str } from '@dynafer/utils';

let projectUrl: string;
for (const loadedScript of document.head.querySelectorAll('script')) {
	if (Str.Contains(loadedScript.src, 'finer.')) {
		const tempSrc: string[] = loadedScript.src.split('/');
		projectUrl = tempSrc.slice(0, tempSrc.length - 1).join('/');
		if (Str.IsEmpty(projectUrl)) projectUrl = '.';
		break;
	}
}

export enum EModeEditor {
	classic = 'classic',
	inline = 'inline',
}

interface IOptions {
	readonly PROJECT_NAME: string,
	readonly SHORT_NAME: string,
	readonly ATTRIBUTE_EDITOR_STYLE: string,
	readonly ATTRIBUTE_FOCUSED: string,
	readonly ATTRIBUTE_SELECTED: string,
	readonly URLS: Record<string, string>,
	JoinUrl: (type: string, name: string) => string,
}

const Options = (): IOptions => {
	const PROJECT_NAME = 'finer-editor';
	const SHORT_NAME = 'finer';
	const ATTRIBUTE_EDITOR_STYLE = 'finer-style';
	const ATTRIBUTE_FOCUSED = 'data-focused';
	const ATTRIBUTE_SELECTED = 'data-selected';
	const URL_PREFIX: string = new URL(projectUrl).pathname;
	const URLS: Record<string, string> = {
		PREFIX: URL_PREFIX,
		CSS: `${URL_PREFIX}`,
		PLUGIN: `${URL_PREFIX}/plugins`,
		ICON: `${URL_PREFIX}/icons`
	};

	const JoinUrl = (type: string, name: string): string => {
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
			default:
				return `${URLS.PREFIX}/${name}`;
		}
	};

	return {
		PROJECT_NAME,
		SHORT_NAME,
		ATTRIBUTE_EDITOR_STYLE,
		ATTRIBUTE_FOCUSED,
		ATTRIBUTE_SELECTED,
		URLS,
		JoinUrl,
	};
};

export default Options();