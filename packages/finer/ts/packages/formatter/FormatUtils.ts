import { Str, Type } from '@dynafer/utils';
import Editor from '../Editor';
import { EFormatType, IFormatOptionBase, IFormatUIOptionBase } from './FormatType';

export const FORMAT_BASES: Record<string, IFormatUIOptionBase> = {
	bold: { Title: 'Bold', Type: EFormatType.TAG, Format: 'strong' },
	italic: { Title: 'Italic', Type: EFormatType.TAG, Format: 'em' },
	strikethrough: { Title: 'Strikethrough', Type: EFormatType.TAG, Format: 's' },
	subscript: { Title: 'Subscript', Type: EFormatType.TAG, Format: 'sub', SameOption: ['fontsize'] },
	superscript: { Title: 'Superscript', Type: EFormatType.TAG, Format: 'sup', SameOption: ['fontsize'] },
	underline: { Title: 'Underline', Type: EFormatType.STYLE, Format: 'text-decoration', FormatValue: 'underline' },
	fontsize: { Title: 'Font size', Type: EFormatType.STYLE, Format: 'font-size', SameOption: ['subscript', 'superscript'] },
	fontfamily: { Title: 'Font family', Type: EFormatType.STYLE, Format: 'font-family' },
	forecolor: { Title: 'Text color', Type: EFormatType.STYLE, Format: 'color' },
	backcolor: { Title: 'Background color', Type: EFormatType.STYLE, Format: 'background-color' },
};

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

export const EscapeUselessStyleChars = (value: string): string => value.replace(/["`';]/g, '');
export const ConvertToDetectorValue = (value: string): string => Str.LowerCase(EscapeUselessStyleChars(value));

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