import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import FormatDetector from '../FormatDetector';
import { ACTIVE_CLASS, EFormatUI, EFormatUIType, IFormatOption, IFormatRegistryJoiner } from '../FormatType';
import FormatUI from '../FormatUI';
import { FORMAT_BASES } from '../FormatUtils';
import FormatCaret from '../FormatCaret';

const Default = (editor: Editor): IFormatRegistryJoiner => {
	const self = editor;
	const detector = FormatDetector(self);
	const UI = FormatUI(self);
	const caretToggler = FormatCaret(self);

	const Formats: Record<string, IFormatOption> = {
		bold: { ...FORMAT_BASES.bold, ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, html: Finer.Icons.Get('Bold') },
		italic: { ...FORMAT_BASES.italic, ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, html: Finer.Icons.Get('Italic') },
		strikethrough: { ...FORMAT_BASES.strikethrough, ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, html: Finer.Icons.Get('Strikethrough') },
		subscript: { ...FORMAT_BASES.subscript, ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, html: Finer.Icons.Get('Subscript') },
		superscript: { ...FORMAT_BASES.superscript, ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, html: Finer.Icons.Get('Superscript') },
		underline: { ...FORMAT_BASES.underline, ui: EFormatUI.BUTTON, uiType: EFormatUIType.ICON, html: Finer.Icons.Get('Underline') },
	};

	const toggleButton = (togglerUI: HTMLElement, bActive: boolean) => {
		const toggle = bActive ? DOM.AddClass : DOM.RemoveClass;
		toggle(togglerUI, ACTIVE_CLASS);
	};

	const Register = (name: string) => {
		if (!Object.keys(Formats).includes(name)) return;
		const formatOption = Formats[name];
		const togglerUI = UI.Create(formatOption, true, () => {
			const bActivated = !DOM.HasClass(togglerUI, ACTIVE_CLASS);
			self.Focus();
			toggleButton(togglerUI, bActivated);
			if (formatOption.sameOption) {
				for (const same of formatOption.sameOption) {
					caretToggler.Toggle(false, FORMAT_BASES[same]);
				}
			}
			caretToggler.Toggle(bActivated, formatOption);
		});
		detector.Register(formatOption, (detectedNode: Node | null) => {
			toggleButton(togglerUI, !!detectedNode);
		});
	};

	return {
		Formats: Object.keys(Formats),
		Register
	};
};

export default Default;