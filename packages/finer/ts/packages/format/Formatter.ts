import Editor from '../Editor';
import * as Icons from '../icons/Icons';
import FormatDetector from './FormatDetector';
import { EFormatType, EFormatUI, IFormat } from './FormatType';
import FormatUI from './FormatUI';

const formats: Record<string, IFormat> = {
	bold: { type: EFormatType.tag, format: 'strong', ui: EFormatUI.button, uiType: 'icon', uiEvent: 'click', html: Icons.Bold },
	italic: { type: EFormatType.tag, format: 'em', ui: EFormatUI.button, uiType: 'icon', uiEvent: 'click', html: Icons.Italic },
	strikethrough: { type: EFormatType.tag, format: 's', ui: EFormatUI.button, uiType: 'icon', uiEvent: 'click', html: Icons.Strikethrough },
	subscript: { type: EFormatType.tag, format: 'sub', ui: EFormatUI.button, uiType: 'icon', uiEvent: 'click', html: Icons.Subscript },
	superscript: { type: EFormatType.tag, format: 'sup', ui: EFormatUI.button, uiType: 'icon', uiEvent: 'click', html: Icons.Superscript },
	underline: { type: EFormatType.style, format: 'text-decoration', formatValue: 'underline', ui: EFormatUI.button, uiType: 'icon', uiEvent: 'click', html: Icons.Underline },
};

const Formats = Object.keys(formats);

export interface IFormatter {
	Register: (name: string) => void
}

const Formatter = (editor: Editor): IFormatter => {
	const self = editor;
	const detector = FormatDetector(self);
	const ui = FormatUI(self);

	const Register = (name: string) => {
		if (!formats[name]) return;

		const format = formats[name];
		const togglerUI = ui.Create(format);
		const activation = (bActive: boolean) => ui.Activate(togglerUI, bActive);

		detector.Register(format.type, format.format, format.formatValue, activation);
	};

	return {
		Register
	};
};

export {
	Formats,
	Formatter
};