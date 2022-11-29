import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import { IFormatDetector } from '../FormatDetector';
import { ACTIVE_CLASS, EFormatUI, EFormatUIType, IFormatOption, IFormatRegistryJoiner } from '../FormatType';
import { IFormatUI } from '../FormatUI';
import { FORMAT_BASES } from '../FormatUtils';

const Default = (editor: Editor, formatDetector: IFormatDetector, formatUI: IFormatUI): IFormatRegistryJoiner => {
	const self = editor;
	const detector = formatDetector;
	const UI = formatUI;

	const Formats: Record<string, IFormatOption> = {
		bold: { ...FORMAT_BASES.bold, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('Bold') },
		italic: { ...FORMAT_BASES.italic, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('Italic') },
		strikethrough: { ...FORMAT_BASES.strikethrough, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('Strikethrough') },
		subscript: { ...FORMAT_BASES.subscript, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('Subscript') },
		superscript: { ...FORMAT_BASES.superscript, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('Superscript') },
		underline: { ...FORMAT_BASES.underline, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('Underline') },
	};

	const toggleButton = (togglerUI: HTMLElement, bActive: boolean) => {
		const toggle = bActive ? DOM.AddClass : DOM.RemoveClass;
		toggle(togglerUI, ACTIVE_CLASS);
	};

	const Register = (name: string) => {
		if (!Arr.Contains(Object.keys(Formats), name)) return;
		const formatOption = Formats[name];
		const togglerUI = UI.Create(formatOption, () => {
			const bActivated = !DOM.HasClass(togglerUI, ACTIVE_CLASS);
			self.Focus();
			toggleButton(togglerUI, bActivated);
			UI.ToggleFormatCaret(formatOption, bActivated);
		});
		self.Toolbar.Add(name, togglerUI);
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