export interface IPluginMediaFormat {
	Tag: string,
}

export interface IPluginsMediaFormatUI {
	Title: string,
	Icon: string,
}

export interface IPluginImageMenuFormatUI {
	Name: string,
	Title: string,
	Icon: string,
	Styles: Record<string, string>,
	SameStyles: string[],
	bAsText?: boolean,
}

export interface IFileSize {
	size: number,
	unit: string,
}
