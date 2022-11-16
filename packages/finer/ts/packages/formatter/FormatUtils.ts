import { Type } from '@dynafer/utils';
import Editor from '../Editor';
import { EFormatType, IFormatOptionBase, IFormatUIOptionBase } from './FormatType';

export const FORMAT_BASES: Record<string, IFormatUIOptionBase> = {
	bold: { label: 'Bold', type: EFormatType.TAG, format: 'strong' },
	italic: { label: 'Italic', type: EFormatType.TAG, format: 'em' },
	strikethrough: { label: 'Strikethrough', type: EFormatType.TAG, format: 's' },
	subscript: { label: 'Subscript', type: EFormatType.TAG, format: 'sub', sameOption: ['fontsize'] },
	superscript: { label: 'Superscript', type: EFormatType.TAG, format: 'sup', sameOption: ['fontsize'] },
	underline: { label: 'Underline', type: EFormatType.STYLE, format: 'text-decoration', formatValue: 'underline' },
	fontsize: { label: 'Font size', type: EFormatType.STYLE, format: 'font-size', sameOption: ['subscript', 'superscript'] },
	fontfamily: { label: 'Font family', type: EFormatType.STYLE, format: 'font-family' },
	forecolor: { label: 'Text color', type: EFormatType.STYLE, format: 'color' },
	backcolor: { label: 'Background color', type: EFormatType.STYLE, format: 'background-color' },
};

export const FindClosest = (editor: Editor, option: IFormatOptionBase, node: Node | null): Element | null => {
	if (!node) return null;
	const DOM = editor.DOM;
	switch (option.type) {
		case EFormatType.TAG:
			return DOM.Closest(node as Element | null, option.format);
		case EFormatType.STYLE:
		default:
			const style: string | Record<string, string> = option.formatValue ? {} : option.format;
			if (Type.IsObject(style) && option.formatValue) style[option.format] = option.formatValue;
			return DOM.ClosestByStyle(node as Element | null, style);
	}
};

export const EscapeUselessStyleChars = (value: string): string => value.replace(/["`';]/g, '');
export const ConvertToDetectorValue = (value: string): string => EscapeUselessStyleChars(value).toLowerCase();

export const GetPrimaryValue = (value: string): string => value.split(',')[0].trim();

export const FlipKeyValue = (options: Record<string, string>): Record<string, string> => {
	const newOptions: Record<string, string> = {};
	for (const [label, option] of Object.entries(options)) {
		newOptions[GetPrimaryValue(option)] = label;
	}
	return newOptions;
};

export const LabelConfiguration = (options: string[] | Record<string, string>): Record<string, string> => {
	const newOptions: Record<string, string> = {};
	if (Type.IsArray(options)) {
		for (const option of options) {
			newOptions[EscapeUselessStyleChars(option)] = ConvertToDetectorValue(option).toLowerCase();
		}
	} else {
		for (const [label, option] of Object.entries(options)) {
			newOptions[EscapeUselessStyleChars(label)] = ConvertToDetectorValue(option).toLowerCase();
		}
	}

	return newOptions;
};

export const CheckFormat = (editor: Editor, option: IFormatOptionBase) =>
	(node: Node): boolean => {
		switch (option.type) {
			case EFormatType.TAG:
				return editor.DOM.Utils.GetNodeName(node) === option.format;
			case EFormatType.STYLE:
				return editor.DOM.HasStyle(node as HTMLElement, option.format, option.formatValue);
			default:
				return false;
		}
	};