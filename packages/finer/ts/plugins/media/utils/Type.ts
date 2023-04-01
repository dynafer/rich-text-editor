export interface IPluginMediaFormat {
	Tag: string,
}

export interface IPluginsMediaFormatUI {
	Title: string,
	Icon: string,
}

export interface IPluginMediaMenuFormatUI {
	Name: string,
	Title: string,
	Icon: string,
	Styles: Record<string, string>,
	SameStyles: string[],
	bAsText?: boolean,
}

export interface IFileSize {
	Size: number,
	Unit: string,
}
