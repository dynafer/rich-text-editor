import { Str } from '@dynafer/utils';

let projectUrl: string;
for (const loadedScript of document.head.querySelectorAll('script')) {
	if (loadedScript.src.includes('finer.')) {
		const tempSrc: string[] = loadedScript.src.split('/');
		projectUrl = tempSrc.slice(0, tempSrc.length - 1).join('/');
		if (Str.IsEmpty(projectUrl)) projectUrl = '.';
		break;
	}
}

export enum EModeEditor {
	classic,
	inline
}

interface IOptions {
	JoinUrl: (type: string, name: string) => string,
	ProjectName: string,
	Urls: Record<string, string>
}

const Options = (): IOptions => {
	const ProjectName: string = 'finer-editor';
	const urlPrefix: string = new URL(projectUrl).pathname;
	const Urls: Record<string, string> = {
		Prefix: urlPrefix,
		Css: `${urlPrefix}`,
		Plugin: `${urlPrefix}/plugins`
	};

	const JoinUrl = (type: string, name: string): string => {
		switch (type) {
			case 'plugin':
				if (!name.includes('.js')) name = `${name}/${name}.min.js`;
				return `${Urls.Plugin}/${name}`;
			case 'css':
				if (!name.includes('.css')) name = `${name}.min.css`;
				return `${Urls.Css}/${name}`;
			default:
				return `${Urls.Prefix}/${name}`;
		}
	};

	return {
		JoinUrl,
		ProjectName,
		Urls
	};
};

export default Options();