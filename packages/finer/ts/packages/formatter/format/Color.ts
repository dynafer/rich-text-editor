import ColorPicker from '@dynafer/colorpicker';
import { Str } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import FormatCaret from '../FormatCaret';
import FormatDetector from '../FormatDetector';
import { EFormatUI, EFormatUIType, IFormatOption, IFormatRegistryJoiner } from '../FormatType';
import FormatUI from '../FormatUI';
import { FORMAT_BASES } from '../FormatUtils';

interface IFormatPalette extends IFormatOption {
	defaultColor: string,
}

const Color = (editor: Editor): IFormatRegistryJoiner => {
	const self = editor;
	const detector = FormatDetector(self);
	const UI = FormatUI(self);
	const caretToggler = FormatCaret(self);

	const Formats: Record<string, IFormatPalette> = {
		forecolor: {
			...FORMAT_BASES.forecolor,
			defaultColor: 'rgb(255, 0, 0)',
			ui: EFormatUI.BUTTON,
			uiType: EFormatUIType.COLOR_ICON,
			html: Finer.Icons.Get('ColorA')
		},
		backcolor: {
			...FORMAT_BASES.backcolor,
			defaultColor: 'rgb(255, 0, 0)',
			ui: EFormatUI.BUTTON,
			uiType: EFormatUIType.COLOR_ICON,
			html: Finer.Icons.Get('Fill')
		}
	};

	const Register = (name: string) => {
		if (!Object.keys(Formats).includes(name)) return;
		const formatOption = Formats[name];

		const colorNavigation = DOM.Create('div', {
			styles: {
				backgroundColor: formatOption.defaultColor
			}
		});

		const button = UI.Create(formatOption, true, () => {
			ColorPicker.Create({
				icons: {
					close: Finer.Icons.Get('Close')
				},
				pick: (rgb: string) => {
					self.Focus();
					caretToggler.Toggle(false, { type: formatOption.type, format: formatOption.format });
					caretToggler.Toggle(true, { type: formatOption.type, format: formatOption.format, formatValue: rgb });
					DOM.SetStyle(colorNavigation, 'background-color', rgb);
				}
			});
		});

		DOM.Insert(button, colorNavigation);

		detector.Register(formatOption, (detectedNode: Node | null) => {
			if (!detectedNode) return;

			const color = self.DOM.GetStyle(detectedNode as HTMLElement, formatOption.format);
			DOM.SetStyle(colorNavigation, 'background-color', Str.IsEmpty(color) ? formatOption.defaultColor : color);
		});
	};

	return {
		Formats: Object.keys(Formats),
		Register,
	};
};

export default Color;