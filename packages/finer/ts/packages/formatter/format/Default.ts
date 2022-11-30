import { Arr } from '@dynafer/utils';
import DOM from '../../dom/DOM';
import { ENativeEvents } from '../../events/EventSetupUtils';
import { IFormatDetector } from '../FormatDetector';
import { EFormatUI, EFormatUIType, IFormatOption, IFormatRegistryJoiner } from '../FormatType';
import { IFormatUI } from '../FormatUI';
import { FORMAT_BASES } from '../FormatUtils';

const Default = (formatDetector: IFormatDetector, formatUI: IFormatUI): IFormatRegistryJoiner => {
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

	const createUI = (option: IFormatOption): HTMLElement => {
		const ui = UI.Create(option);
		const clickEvent = UI.CreateDefaultUIClickEvent(ui, (bActivated: boolean) => UI.ToggleFormatCaret(option, bActivated));
		DOM.On(ui, ENativeEvents.click, clickEvent);

		detector.Register(option, (detectedNode: Node | null) => UI.ToggleDefaultButton(ui, !!detectedNode));

		return ui;
	};

	const Register = (name: string): HTMLElement | null => {
		if (!Arr.Contains(Object.keys(Formats), name)) return null;
		const formatOption = Formats[name];

		return createUI(formatOption);
	};

	return {
		Formats: Object.keys(Formats),
		Register
	};
};

export default Default;