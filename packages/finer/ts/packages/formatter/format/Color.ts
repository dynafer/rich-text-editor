import ColorPicker from '@dynafer/colorpicker';
import { Arr, Str } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import FormatCaret from '../FormatCaret';
import { EFormatUI, EFormatUIType, IFormatOption, IFormatRegistryJoiner } from '../FormatType';
import FormatUI from '../FormatUI';
import { FORMAT_BASES } from '../FormatUtils';

interface IFormatPalette extends IFormatOption {
	CurrenttColor: string,
}

const Color = (editor: Editor): IFormatRegistryJoiner => {
	const self = editor;
	const UI = FormatUI(self);
	const caretToggler = FormatCaret(self);

	const Formats: Record<string, IFormatPalette> = {
		forecolor: {
			...FORMAT_BASES.forecolor,
			CurrenttColor: 'rgb(255, 0, 0)',
			UIName: EFormatUI.DIV,
			UIType: EFormatUIType.COLOR_ICON,
			Html: Finer.Icons.Get('ColorA')
		},
		backcolor: {
			...FORMAT_BASES.backcolor,
			CurrenttColor: 'rgb(255, 0, 0)',
			UIName: EFormatUI.DIV,
			UIType: EFormatUIType.COLOR_ICON,
			Html: Finer.Icons.Get('Fill')
		}
	};

	const Register = (name: string) => {
		if (!Arr.Contains(Object.keys(Formats), name)) return;
		const formatOption = Formats[name];

		const colorNavigation = DOM.Create('div', {
			styles: {
				backgroundColor: formatOption.CurrenttColor
			}
		});

		const wrapper = DOM.Create(Str.LowerCase(EFormatUI.BUTTON), {
			attrs: {
				title: formatOption.Title
			},
			class: DOM.Utils.CreateUEID(Str.LowerCase(EFormatUIType.ICON_WRAP.replace(/_/gi, '-')), false),
		});

		const button = UI.Create(formatOption, () => {
			self.Focus();
			const rgb = DOM.GetStyle(colorNavigation, 'background-color');
			caretToggler.Toggle(false, { Type: formatOption.Type, Format: formatOption.Format });
			caretToggler.Toggle(true, { Type: formatOption.Type, Format: formatOption.Format, FormatValue: rgb });
		});

		const helper = UI.Create({
			Title: formatOption.Title,
			UIName: EFormatUI.DIV,
			UIType: EFormatUIType.HELPER,
			Html: Finer.Icons.Get('AngleDown'),
		}, () => {
			ColorPicker.Create({
				Icons: {
					Close: Finer.Icons.Get('Close')
				},
				Pick: (rgb: string) => {
					self.Focus();
					caretToggler.Toggle(false, { Type: formatOption.Type, Format: formatOption.Format });
					caretToggler.Toggle(true, { Type: formatOption.Type, Format: formatOption.Format, FormatValue: rgb });
					DOM.SetStyle(colorNavigation, 'background-color', rgb);
				}
			});
		});

		DOM.Insert(button, colorNavigation);
		DOM.Insert(wrapper, [button, helper]);

		self.Toolbar.Add(name, wrapper);
	};

	return {
		Formats: Object.keys(Formats),
		Register,
	};
};

export default Color;