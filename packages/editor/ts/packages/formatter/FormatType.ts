export enum EFormatType {
	BLOCK = 'BLOCK',
	INLINE = 'INLINE',
	STYLE = 'STYLE',
	LIST = 'LIST',
}

export type TFormat = IBlockFormat | IInlineFormat | IStyleFormat;

export type TFormatDetectCallback = (paths: Node[]) => void;

export interface IBlockFormat {
	readonly Type: EFormatType.BLOCK,
	readonly Tag: string,
	readonly Switchable: Set<string>,
	readonly AddInside: Set<string>,
	readonly UnsetSwitcher?: string,
	readonly DisableList?: Set<string>,
}

export interface IInlineFormat {
	readonly Type: EFormatType.INLINE,
	readonly Tag: string,
	readonly Styles?: Record<string, string>,
	readonly SameFormats?: string[],
	readonly DisableList?: Set<string>,
}

export interface IStyleFormat {
	readonly Type: EFormatType.STYLE,
	readonly StrictFormats: Set<string>,
	readonly Styles: Record<string, string>,
	readonly SameStyles?: string[],
	readonly DisableList?: Set<string>,
}

export interface IFormatUIRegistryUnit {
	readonly UINames: string[],
	Create: (name: string) => HTMLElement,
}

export interface IToggleRecursiveOption {
	except?: Node[],
	endNode?: Node,
	value?: string,
	bInline?: boolean,
}