export interface IPluginTableFormat {
	readonly Tag: string,
}

export interface IPluginsTableFormatUI {
	readonly Format: IPluginTableFormat,
	readonly Title: string,
	readonly Icon: string,
}

export interface IPluginTableMenuFormatUI {
	readonly Title: string,
	readonly CommandName: string,
	readonly Icon: string,
}

export interface IPluginTableCommand {
	readonly Name: string,
	readonly Styles: Record<string, string>,
	readonly SameStyles: string[],
	readonly bAsText?: boolean,
}