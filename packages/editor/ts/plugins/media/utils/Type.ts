export interface IPluginMediaFormat {
	Tag: string,
}

export interface IPluginsMediaFormatUI {
	readonly Title: string,
	readonly Icon: string,
}

export interface IPluginMediaMenuFormatUI {
	readonly Title: string,
	readonly CommandName: string,
	readonly Icon: string,
}

export interface IPluginMediaCommand {
	readonly Name: string,
	readonly Styles: Record<string, string>,
	readonly SameStyles: string[],
	readonly bAsText?: boolean,
}

export interface IFileSize {
	Size: number,
	Unit: string,
}
