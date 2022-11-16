import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import * as Icons from '../../icons/Icons';
import { EFormatUI, EFormatUIType, IFormatOption, IFormatRegistryJoiner } from '../FormatType';
import FormatUI from '../FormatUI';
import { FORMAT_BASES } from '../FormatUtils';

interface IFormatPalette extends IFormatOption {
	defaultColor: string,
}

const Color = (editor: Editor): IFormatRegistryJoiner => {
	const self = editor;
	const UI = FormatUI(self);

	const Formats: Record<string, IFormatPalette> = {
		forecolor: {
			...FORMAT_BASES.forecolor,
			defaultColor: 'rgb(255, 0, 0)',
			ui: EFormatUI.BUTTON,
			uiType: EFormatUIType.COLOR_ICON,
			html: Icons.ColorA
		},
		backcolor: {
			...FORMAT_BASES.backcolor,
			defaultColor: 'rgb(255, 0, 0)',
			ui: EFormatUI.BUTTON,
			uiType: EFormatUIType.COLOR_ICON,
			html: Icons.Fill
		}
	};

	const Register = (name: string) => {
		if (!Object.keys(Formats).includes(name)) return;
		const formatOption = Formats[name];
		const button = UI.Create(formatOption, true, () => {
			// open color picker
		});

		const colorNavigation = DOM.Create('div', {
			styles: {
				backgroundColor: formatOption.defaultColor
			}
		});

		DOM.Insert(button, colorNavigation);
	};

	return {
		Formats: Object.keys(Formats),
		Register,
	};
};

export default Color;