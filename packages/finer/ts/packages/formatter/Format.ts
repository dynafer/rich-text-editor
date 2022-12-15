import { EFormatType, TFormat } from './FormatType';

export const BlockFormatTags = {
	Figures: new Set(['figure', 'img', 'audio', 'video']),
	Table: new Set(['table']),
	TableItems: new Set(['tr', 'td', 'th']),
	Block: new Set(['p', 'div', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
	List: new Set(['li', 'ol', 'ul', 'dl']),
};
export const UnswitchableFormats = new Set([...BlockFormatTags.TableItems, ...BlockFormatTags.List]);
export const AllStrictFormats = new Set([...BlockFormatTags.Block, ...UnswitchableFormats]);
export const AllBlockFormats = new Set([...BlockFormatTags.Figures, ...BlockFormatTags.Table, ...BlockFormatTags.TableItems, ...BlockFormatTags.Block, ...BlockFormatTags.List]);

export const Formats: Record<string, TFormat | TFormat[]> = {
	Bold: [
		{ FormatType: EFormatType.INLINE, Tag: 'strong' },
		{ FormatType: EFormatType.INLINE, Tag: 'span', Styles: { fontWeight: 'bold' } },
		{ FormatType: EFormatType.INLINE, Tag: 'b' },
	],
	Italic: [
		{ FormatType: EFormatType.INLINE, Tag: 'em' },
		{ FormatType: EFormatType.INLINE, Tag: 'span', Styles: { fontStyle: 'italic' } },
		{ FormatType: EFormatType.INLINE, Tag: 'i' },
	],
	Strikethrough: [
		{ FormatType: EFormatType.INLINE, Tag: 's' },
		{ FormatType: EFormatType.INLINE, Tag: 'span', Styles: { fontStyle: 'italic' } },
		{ FormatType: EFormatType.INLINE, Tag: 'strike' },
	],
	Subscript: { FormatType: EFormatType.INLINE, Tag: 'sub', SameFormats: ['Superscript', 'FontSize'] },
	Superscript: { FormatType: EFormatType.INLINE, Tag: 'sup', SameFormats: ['Subscript', 'FontSize'] },
	Underline: [
		{ FormatType: EFormatType.INLINE, Tag: 'span', Styles: { textDecoration: 'underline' } },
		{ FormatType: EFormatType.INLINE, Tag: 'u' },
	],
	Code: { FormatType: EFormatType.INLINE, Tag: 'code' },
	FontSize: { FormatType: EFormatType.INLINE, Tag: 'span', Styles: { fontSize: '{{value}}' }, SameFormats: ['Superscript', 'Subscript'] },
	FontFamily: { FormatType: EFormatType.INLINE, Tag: 'span', Styles: { fontFamily: '{{value}}' } },
	ForeColor: { FormatType: EFormatType.INLINE, Tag: 'span', Styles: { color: '{{value}}' } },
	BackColor: { FormatType: EFormatType.INLINE, Tag: 'span', Styles: { backgroundColor: '{{value}}' } },

	Outdent: {
		FormatType: EFormatType.STYLE,
		StrictFormats: new Set(['figure', ...AllStrictFormats]),
		Styles: { marginLeft: '{{value}}' }
	},
	Indent: {
		FormatType: EFormatType.STYLE,
		StrictFormats: new Set(['figure', ...AllStrictFormats]),
		Styles: { marginLeft: '{{value}}' }
	},
	Justify: {
		FormatType: EFormatType.STYLE,
		StrictFormats: new Set([...BlockFormatTags.Figures, ...AllStrictFormats]),
		Styles: { textAlign: 'justify' }
	},
	AlignLeft: [
		{ FormatType: EFormatType.STYLE, StrictFormats: BlockFormatTags.Figures, Styles: { float: 'left' } },
		{ FormatType: EFormatType.STYLE, StrictFormats: BlockFormatTags.Table, Styles: { marginLeft: '0px', marginRight: 'auto' } },
		{ FormatType: EFormatType.STYLE, StrictFormats: AllStrictFormats, Styles: { textAlign: 'left' } }
	],
	AlignCenter: [
		{ FormatType: EFormatType.STYLE, StrictFormats: BlockFormatTags.Figures, Styles: { float: 'center' } },
		{ FormatType: EFormatType.STYLE, StrictFormats: BlockFormatTags.Table, Styles: { marginLeft: 'auto', marginRight: 'auto' } },
		{ FormatType: EFormatType.STYLE, StrictFormats: AllStrictFormats, Styles: { textAlign: 'center' } }
	],
	AlignRight: [
		{ FormatType: EFormatType.STYLE, StrictFormats: BlockFormatTags.Figures, Styles: { float: 'right' } },
		{ FormatType: EFormatType.STYLE, StrictFormats: BlockFormatTags.Table, Styles: { marginLeft: 'auto', marginRight: '0px' } },
		{ FormatType: EFormatType.STYLE, StrictFormats: AllStrictFormats, Styles: { textAlign: 'right' } }
	],

	Paragraph: { FormatType: EFormatType.BLOCK, Tag: 'p', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats },
	Heading1: { FormatType: EFormatType.BLOCK, Tag: 'h1', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Heading2: { FormatType: EFormatType.BLOCK, Tag: 'h2', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Heading3: { FormatType: EFormatType.BLOCK, Tag: 'h3', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Heading4: { FormatType: EFormatType.BLOCK, Tag: 'h4', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Heading5: { FormatType: EFormatType.BLOCK, Tag: 'h5', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Heading6: { FormatType: EFormatType.BLOCK, Tag: 'h6', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Div: { FormatType: EFormatType.BLOCK, Tag: 'div', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Blockquote: { FormatType: EFormatType.BLOCK, Tag: 'blockquote', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Pre: { FormatType: EFormatType.BLOCK, Tag: 'pre', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },

	OrderedList: { FormatType: EFormatType.LIST, Tag: 'ol', Switchable: BlockFormatTags.List, Following: 'li', UnsetSwitcher: 'p' },
	UnorderedList: { FormatType: EFormatType.LIST, Tag: 'ul', Switchable: BlockFormatTags.List, Following: 'li', UnsetSwitcher: 'p' },
	DescriptionList: { FormatType: EFormatType.LIST, Tag: 'dl', Switchable: BlockFormatTags.List, Following: 'li', UnsetSwitcher: 'p' },
};