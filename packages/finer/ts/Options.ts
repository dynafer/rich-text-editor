
interface IOptions {
	JoinUrl: (type: string, name: string) => string,
	ProjectName: string,
	Urls: Record<string, string>
}

const Options = (): IOptions => {
	const ProjectName: string = 'finer-editor';
	const urlPrefix: string = '.';
	const Urls: Record<string, string> = {
		Prefix: urlPrefix,
		Plugin: `${urlPrefix}/plugins`
	};

	const JoinUrl = (type: string, name: string): string => {
		switch (type) {
			case 'plugin':
				if (!name.includes('.js')) name = `${name}/${name}.min.js`;
				return `${Urls.Plugin}/${name}`;
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