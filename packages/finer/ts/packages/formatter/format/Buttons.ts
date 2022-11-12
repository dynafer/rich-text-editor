import Editor from '../../Editor';
import { ENativeEvents } from '../../events/EventSetupUtils';
import * as Icons from '../../icons/Icons';
import FormatDetector from '../FormatDetector';
import { EFormatType, EFormatUI, EFormatUIType, IFormatOption, IFormatRegistryJoiner } from '../FormatType';
import FormatUI from '../FormatUI';

const Buttons = (editor: Editor): IFormatRegistryJoiner => {
	const self = editor;
	const detector = FormatDetector(self);
	const UI = FormatUI(self);

	const Formats: Record<string, IFormatOption> = {
		bold: { type: EFormatType.TAG, format: 'strong', ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, uiEvent: ENativeEvents.click, html: Icons.Bold },
		italic: { type: EFormatType.TAG, format: 'em', ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, uiEvent: ENativeEvents.click, html: Icons.Italic },
		strikethrough: { type: EFormatType.TAG, format: 's', ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, uiEvent: ENativeEvents.click, html: Icons.Strikethrough },
		subscript: { type: EFormatType.TAG, format: 'sub', ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, uiEvent: ENativeEvents.click, html: Icons.Subscript },
		superscript: { type: EFormatType.TAG, format: 'sup', ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, uiEvent: ENativeEvents.click, html: Icons.Superscript },
		underline: {
			type: EFormatType.STYLE, format: 'text-decoration', formatValue: 'underline', ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, uiEvent: ENativeEvents.click, html: Icons.Underline
		}
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

export default Buttons;