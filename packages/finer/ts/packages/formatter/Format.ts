import { Str } from '@dynafer/utils';
import Figure from '../dom/elements/Figure';
import { EFormatType, TFormat } from './FormatType';

export const FigureNotTableSelector = Str.Merge(Figure.Selector, ':not([type="table"])');
export const TableSelector = 'table';
export const TableRowSelector = 'tr';
export const TableCellSet = new Set(['th', 'td']);
export const TableCellSelector = Str.Join(',', ...TableCellSet);
export const ListSet = new Set(['ol', 'ul']);
export const ListSelector = Str.Join(',', ...ListSet);
export const ListItemSelector = 'li';
export const FigureElementSet = new Set(['img', 'audio', 'video']);

export const BlockFormatTags = {
	Figures: new Set([Figure.Selector, 'img', 'audio', 'video']),
	Table: new Set([TableSelector]),
	TableItems: new Set([...TableCellSet, TableRowSelector]),
	Block: new Set(['p', 'div', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
	List: new Set([ListItemSelector, ...ListSet]),
	FollowingItems: new Set([ListItemSelector, ...TableCellSet]),
};

export const AllDisableList = new Set([FigureNotTableSelector, ...FigureElementSet]);
export const FigureElementFormats = new Set([...BlockFormatTags.Figures, ...BlockFormatTags.Table]);
export const UnswitchableFormats = new Set([...BlockFormatTags.TableItems, ...BlockFormatTags.List]);
export const AllStrictFormats = new Set([...BlockFormatTags.Block, ...UnswitchableFormats]);
export const AllBlockFormats = new Set([Figure.Selector, ...BlockFormatTags.Table, ...BlockFormatTags.TableItems, ...BlockFormatTags.Block, ...BlockFormatTags.List]);

export const Formats: Record<string, TFormat | TFormat[]> = {
	Bold: [
		{ Type: EFormatType.INLINE, Tag: 'strong', DisableList: AllDisableList },
		{ Type: EFormatType.INLINE, Tag: 'span', Styles: { fontWeight: 'bold' } },
		{ Type: EFormatType.INLINE, Tag: 'b' },
	],
	Italic: [
		{ Type: EFormatType.INLINE, Tag: 'em', DisableList: AllDisableList },
		{ Type: EFormatType.INLINE, Tag: 'span', Styles: { fontStyle: 'italic' } },
		{ Type: EFormatType.INLINE, Tag: 'i' },
	],
	Strikethrough: [
		{ Type: EFormatType.INLINE, Tag: 's', DisableList: AllDisableList },
		{ Type: EFormatType.INLINE, Tag: 'span', Styles: { fontStyle: 'italic' } },
		{ Type: EFormatType.INLINE, Tag: 'strike' },
	],
	Subscript: { Type: EFormatType.INLINE, Tag: 'sub', SameFormats: ['Superscript', 'FontSize'], DisableList: AllDisableList },
	Superscript: { Type: EFormatType.INLINE, Tag: 'sup', SameFormats: ['Subscript', 'FontSize'], DisableList: AllDisableList },
	Underline: [
		{ Type: EFormatType.INLINE, Tag: 'span', Styles: { textDecoration: 'underline' }, DisableList: AllDisableList },
		{ Type: EFormatType.INLINE, Tag: 'u' },
	],
	Code: { Type: EFormatType.INLINE, Tag: 'code', DisableList: AllDisableList },
	FontSize: { Type: EFormatType.INLINE, Tag: 'span', Styles: { fontSize: '{{value}}' }, SameFormats: ['Superscript', 'Subscript'], DisableList: AllDisableList },
	FontFamily: { Type: EFormatType.INLINE, Tag: 'span', Styles: { fontFamily: '{{value}}' }, DisableList: AllDisableList },
	ForeColor: { Type: EFormatType.INLINE, Tag: 'span', Styles: { color: '{{value}}' }, DisableList: AllDisableList },
	BackColor: { Type: EFormatType.INLINE, Tag: 'span', Styles: { backgroundColor: '{{value}}' }, DisableList: AllDisableList },

	Outdent: {
		Type: EFormatType.STYLE,
		StrictFormats: new Set([Figure.Selector, ...AllStrictFormats]),
		Styles: { marginLeft: '{{value}}' },
		DisableList: AllDisableList
	},
	Indent: {
		Type: EFormatType.STYLE,
		StrictFormats: new Set([Figure.Selector, ...AllStrictFormats]),
		Styles: { marginLeft: '{{value}}' },
		DisableList: AllDisableList
	},
	Justify: {
		Type: EFormatType.STYLE,
		StrictFormats: new Set([...AllStrictFormats]),
		Styles: { textAlign: 'justify' },
		SameStyles: ['margin-left', 'margin-right', 'float'],
		DisableList: AllDisableList
	},
	AlignLeft: [
		{ Type: EFormatType.STYLE, StrictFormats: new Set<string>(), Styles: {}, DisableList: AllDisableList },
		{ Type: EFormatType.STYLE, StrictFormats: AllStrictFormats, Styles: { textAlign: 'left' }, SameStyles: ['margin-left', 'margin-right', 'float'] },
		{ Type: EFormatType.STYLE, StrictFormats: BlockFormatTags.Table, Styles: { marginLeft: '0px', marginRight: 'auto' }, SameStyles: ['text-align', 'float'] },
		{ Type: EFormatType.STYLE, StrictFormats: BlockFormatTags.Figures, Styles: { marginLeft: '0px', marginRight: 'auto' }, SameStyles: ['text-align', 'float'] }
	],
	AlignCenter: [
		{ Type: EFormatType.STYLE, StrictFormats: new Set<string>(), Styles: {}, DisableList: AllDisableList },
		{ Type: EFormatType.STYLE, StrictFormats: AllStrictFormats, Styles: { textAlign: 'center' }, SameStyles: ['margin-left', 'margin-right', 'float'] },
		{ Type: EFormatType.STYLE, StrictFormats: BlockFormatTags.Table, Styles: { marginLeft: 'auto', marginRight: 'auto' }, SameStyles: ['text-align', 'float'] },
		{ Type: EFormatType.STYLE, StrictFormats: BlockFormatTags.Figures, Styles: { marginLeft: 'auto', marginRight: 'auto' }, SameStyles: ['text-align', 'float'] }
	],
	AlignRight: [
		{ Type: EFormatType.STYLE, StrictFormats: new Set<string>(), Styles: {}, DisableList: AllDisableList },
		{ Type: EFormatType.STYLE, StrictFormats: AllStrictFormats, Styles: { textAlign: 'right' }, SameStyles: ['margin-left', 'margin-right', 'float'] },
		{ Type: EFormatType.STYLE, StrictFormats: BlockFormatTags.Table, Styles: { marginLeft: 'auto', marginRight: '0px' }, SameStyles: ['text-align', 'float'] },
		{ Type: EFormatType.STYLE, StrictFormats: BlockFormatTags.Figures, Styles: { marginLeft: 'auto', marginRight: '0px' }, SameStyles: ['text-align', 'float'] }
	],

	Paragraph: { Type: EFormatType.BLOCK, Tag: 'p', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats },
	Heading1: { Type: EFormatType.BLOCK, Tag: 'h1', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Heading2: { Type: EFormatType.BLOCK, Tag: 'h2', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Heading3: { Type: EFormatType.BLOCK, Tag: 'h3', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Heading4: { Type: EFormatType.BLOCK, Tag: 'h4', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Heading5: { Type: EFormatType.BLOCK, Tag: 'h5', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Heading6: { Type: EFormatType.BLOCK, Tag: 'h6', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Div: { Type: EFormatType.BLOCK, Tag: 'div', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Blockquote: { Type: EFormatType.BLOCK, Tag: 'blockquote', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
	Pre: { Type: EFormatType.BLOCK, Tag: 'pre', Switchable: BlockFormatTags.Block, AddInside: UnswitchableFormats, UnsetSwitcher: 'p' },
};