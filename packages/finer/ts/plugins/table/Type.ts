export interface IPluginTableFormat {
	Tag: string,
}

export interface IPluginsTableFormatUI {
	Format: IPluginTableFormat,
	Title: string,
	Icon: string,
}

export interface IPluginTableMenuFormatUI {
	Name: string,
	Title: string,
	Icon: string,
	Styles: Record<string, string>,
	SameStyles: string[],
	bAsText?: boolean,
}