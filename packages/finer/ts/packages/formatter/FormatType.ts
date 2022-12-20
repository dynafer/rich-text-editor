export enum EFormatType {
	BLOCK = 'BLOCK',
	INLINE = 'INLINE',
	STYLE = 'STYLE',
	LIST = 'LIST',
}

export type TFormat = IBlockFormat | IInlineFormat | IStyleFormat;

export type TFormatDetectCallback = (paths: Node[]) => void;

export interface IBlockFormat {
	FormatType: EFormatType.BLOCK,
	Tag: string,
	Switchable: Set<string>,
	AddInside: Set<string>,
	UnsetSwitcher?: string,
}

export interface IInlineFormat {
	FormatType: EFormatType.INLINE,
	Tag: string,
	Styles?: Record<string, string>,
	SameFormats?: string[],
}

export interface IStyleFormat {
	FormatType: EFormatType.STYLE,
	StrictFormats: Set<string>,
	Styles: Record<string, string>,
}

export interface IFormatUIRegistryUnit {
	UINames: string[],
	Create: (name: string) => HTMLElement,
}

export interface IToggleRecursiveOption {
	except?: Node[],
	endNode?: Node,
	value?: string;
}