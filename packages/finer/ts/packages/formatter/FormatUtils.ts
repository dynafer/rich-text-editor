import { Str, Type } from '@dynafer/utils';
import Editor from '../Editor';
import { EFormatType, IFormatOptionBase, IFormatUIOptionBase, STANDARD_PIXEL_FROM_ROOT } from './FormatType';

export const FORMAT_BASES: Record<string, IFormatUIOptionBase> = {
	bold: { Title: 'Bold', Type: EFormatType.TAG, Format: 'strong' },
	italic: { Title: 'Italic', Type: EFormatType.TAG, Format: 'em' },
	strikethrough: { Title: 'Strikethrough', Type: EFormatType.TAG, Format: 's' },
	subscript: { Title: 'Subscript', Type: EFormatType.TAG, Format: 'sub', SameOption: ['fontsize', 'superscript'] },
	superscript: { Title: 'Superscript', Type: EFormatType.TAG, Format: 'sup', SameOption: ['fontsize', 'subscript'] },
	underline: { Title: 'Underline', Type: EFormatType.STYLE, Format: 'text-decoration', FormatValue: 'underline' },
	code: { Title: 'Underline', Type: EFormatType.TAG, Format: 'code' },
	fontsize: { Title: 'Font size', Type: EFormatType.STYLE, Format: 'font-size', SameOption: ['subscript', 'superscript'] },
	fontfamily: { Title: 'Font family', Type: EFormatType.STYLE, Format: 'font-family' },
	forecolor: { Title: 'Text color', Type: EFormatType.STYLE, Format: 'color' },
	backcolor: { Title: 'Background color', Type: EFormatType.STYLE, Format: 'background-color' },
	outdent: { Title: 'Outdent', Type: EFormatType.STYLE, Format: 'padding-left', bTopNode: true },
	indent: { Title: 'Indent', Type: EFormatType.STYLE, Format: 'padding-left', bTopNode: true },
	justify: { Title: 'Justify', Type: EFormatType.STYLE, Format: 'text-align', FormatValue: 'justify', bTopNode: true },
	alignleft: { Title: 'Align left', Type: EFormatType.STYLE, Format: 'text-align', FormatValue: 'left', bTopNode: true },
	aligncenter: { Title: 'Align center', Type: EFormatType.STYLE, Format: 'text-align', FormatValue: 'center', bTopNode: true },
	alignright: { Title: 'Align right', Type: EFormatType.STYLE, Format: 'text-align', FormatValue: 'right', bTopNode: true },
};

export const ConvertToElement = (editor: Editor, node: Node | null, bNode: boolean = false): Node | Element | null =>
	node && editor.DOM.Utils.IsText(node)
		? (bNode ? node.parentNode : node.parentElement)
		: node as Element | null;

export const FindClosest = (editor: Editor, option: IFormatOptionBase, node: Node | null): Element | null => {
	if (!node) return null;
	const DOM = editor.DOM;
	switch (option.Type) {
		case EFormatType.TAG:
			return DOM.Closest(node as Element | null, option.Format);
		case EFormatType.STYLE:
		default:
			const style: string | Record<string, string> = option.FormatValue ? {} : option.Format;
			if (Type.IsObject(style) && option.FormatValue) style[option.Format] = option.FormatValue;
			return DOM.ClosestByStyle(node as Element | null, style);
	}
};

export const FindTopNode = (editor: Editor, node: Node | null): Node | null => {
	if (!node) return null;
	let topNode = ConvertToElement(editor, node);
	while (topNode) {
		if (topNode.parentElement === editor.GetBody()) break;
		topNode = topNode.parentElement;
	}
	return topNode;
};

export const FindTopNodeStrict = (editor: Editor, option: IFormatOptionBase, node: Node | null): Node | null => {
	const topNode = FindTopNode(editor, node);
	if (!topNode) return null;

	const DOM = editor.DOM;

	const { Format, FormatValue } = option;
	switch (option.Type) {
		case EFormatType.TAG:
			return DOM.Utils.GetNodeName(topNode) === option.Format ? topNode : null;
		case EFormatType.STYLE:
			if (!FormatValue) return DOM.HasStyle(topNode as HTMLElement, Format) ? topNode : null;
			const style = DOM.GetStyle(topNode as HTMLElement, Format);
			return style === FormatValue ? topNode : null;
		default:
			return null;
	}
};

export const EscapeUselessStyleChars = (value: string): string => value.replace(/["`';]/g, '');
export const ConvertToDetectorValue = (value: string): string => Str.LowerCase(EscapeUselessStyleChars(value)).trim();

export const GetPrimaryValue = (value: string): string => value.split(',')[0].trim();

export const FlipKeyValue = (options: Record<string, string>): Record<string, string> => {
	const newOptions: Record<string, string> = {};
	for (const [title, option] of Object.entries(options)) {
		newOptions[GetPrimaryValue(option)] = title;
	}
	return newOptions;
};

export const LabelConfiguration = (options: string[] | Record<string, string>): Record<string, string> => {
	const newOptions: Record<string, string> = {};
	if (Type.IsArray(options)) {
		for (const option of options) {
			newOptions[EscapeUselessStyleChars(option)] = Str.LowerCase(ConvertToDetectorValue(option));
		}
	} else {
		for (const [title, option] of Object.entries(options)) {
			newOptions[EscapeUselessStyleChars(title)] = Str.LowerCase(ConvertToDetectorValue(option));
		}
	}

	return newOptions;
};

export const CheckFormat = (editor: Editor, option: IFormatOptionBase) =>
	(node: Node): boolean => {
		switch (option.Type) {
			case EFormatType.TAG:
				return editor.DOM.Utils.GetNodeName(node) === option.Format;
			case EFormatType.STYLE:
				return editor.DOM.HasStyle(node as HTMLElement, option.Format, option.FormatValue);
			default:
				return false;
		}
	};

export const ConvertToPixel = (value: string): string => {
	const defaultType = Str.LowerCase(value.replace(/[^a-z]/gi, ''));

	if (defaultType.includes('em')) {
		return Str.Merge(
			(parseFloat(value) * STANDARD_PIXEL_FROM_ROOT).toString(),
			'px'
		);
	}

	if (Str.IsEmpty(defaultType)) return Str.Merge(STANDARD_PIXEL_FROM_ROOT.toString(), 'px');

	return defaultType;
};