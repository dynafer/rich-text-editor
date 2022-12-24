export interface IPluginListFormat {
	Tag: string,
	Switchable: Set<string>,
	Following: string,
	UnsetSwitcher: string,
}

export interface IPluginListFormatUI {
	Format: IPluginListFormat,
	Title: string,
	Icon: string,
}