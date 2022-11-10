import Editor from '../../Editor';
import * as Icons from '../../icons/Icons';
import FormatDetector from '../FormatDetector';
import { EFormatType, EFormatUI, IFormatOption } from '../FormatType';
import FormatUI from '../FormatUI';

const Tag = (editor: Editor) => {
	const self = editor;
	const detector = FormatDetector(self);
	const UI = FormatUI(self);

	const Formats: Record<string, IFormatOption> = {
		bold: { type: EFormatType.TAG, format: 'strong', ui: EFormatUI.BUTTON, uiType: 'icon', uiEvent: 'click', html: Icons.Bold },
		italic: { type: EFormatType.TAG, format: 'em', ui: EFormatUI.BUTTON, uiType: 'icon', uiEvent: 'click', html: Icons.Italic },
		strikethrough: { type: EFormatType.TAG, format: 's', ui: EFormatUI.BUTTON, uiType: 'icon', uiEvent: 'click', html: Icons.Strikethrough },
		subscript: { type: EFormatType.TAG, format: 'sub', ui: EFormatUI.BUTTON, uiType: 'icon', uiEvent: 'click', html: Icons.Subscript },
		superscript: { type: EFormatType.TAG, format: 'sup', ui: EFormatUI.BUTTON, uiType: 'icon', uiEvent: 'click', html: Icons.Superscript },
		underline: { type: EFormatType.STYLE, format: 'text-decoration', formatValue: 'underline', ui: EFormatUI.BUTTON, uiType: 'icon', uiEvent: 'click', html: Icons.Underline }
	};

	const Register = (name: string) => {
		if (!Object.keys(Formats).includes(name)) return;
		const format = Formats[name];
		const togglerUI = UI.Create(format);
		detector.Register(format, (bActive: boolean) => UI.Activate(togglerUI, bActive));
	};

	return {
		Formats: Object.keys(Formats),
		Register
	};
};

export default Tag;