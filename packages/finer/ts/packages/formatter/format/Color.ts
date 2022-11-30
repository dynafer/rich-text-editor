import ColorPicker from '@dynafer/colorpicker';
import { Arr, Str } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import { ENativeEvents } from '../../events/EventSetupUtils';
import { EFormatType, EFormatUI, EFormatUIType, IFormatOption, IFormatRegistryJoiner } from '../FormatType';
import { IFormatUI } from '../FormatUI';
import { FORMAT_BASES } from '../FormatUtils';

interface IFormatPalette extends IFormatOption {
	DefaultColor: string,
	LastPicked: [number, number, number][],
}

const Color = (editor: Editor, formatUI: IFormatUI): IFormatRegistryJoiner => {
	const self = editor;
	const UI = formatUI;

	const Formats: Record<string, IFormatPalette> = {
		forecolor: {
			...FORMAT_BASES.forecolor,
			UIName: EFormatUI.DIV,
			UIType: EFormatUIType.COLOR_ICON,
			Html: Finer.Icons.Get('ColorA'),
			DefaultColor: ColorPicker.Utils.RGBA.ToRGB(255, 0, 0),
			LastPicked: [],
		},
		backcolor: {
			...FORMAT_BASES.backcolor,
			UIName: EFormatUI.DIV,
			UIType: EFormatUIType.COLOR_ICON,
			Html: Finer.Icons.Get('Fill'),
			DefaultColor: ColorPicker.Utils.RGBA.ToRGB(255, 0, 0),
			LastPicked: [],
		},
	};

	// color, lighter 40%, lighter 30%, lighter 20%, lighter 10%, darker 10%, darker 20%, darker 30%
	const standardColors: [number, number, number][][] = [
		[[255, 255, 255], [242, 242, 242], [230, 230, 230], [217, 217, 217], [204, 204, 204], [191, 191, 191], [166, 166, 166], [140, 140, 140]],
		[[0, 0, 0], [128, 128, 128], [115, 115, 115], [102, 102, 102], [77, 77, 77], [51, 51, 51], [38, 38, 38], [26, 26, 26]],
		[[255, 0, 0], [255, 204, 204], [255, 153, 153], [255, 102, 102], [255, 51, 51], [204, 0, 0], [153, 0, 0], [102, 0, 0]],
		[[255, 153, 0], [255, 235, 204], [255, 214, 153], [255, 194, 102], [255, 173, 51], [204, 122, 0], [153, 92, 0], [102, 61, 0]],
		[[255, 255, 0], [255, 255, 204], [255, 255, 153], [255, 255, 102], [255, 255, 51], [204, 204, 0], [153, 153, 0], [102, 102, 0]],
		[[51, 204, 51], [214, 245, 214], [173, 235, 173], [132, 225, 132], [91, 215, 91], [40, 164, 40], [30, 123, 30], [20, 82, 20]],
		[[0, 0, 255], [204, 204, 255], [153, 153, 255], [102, 102, 255], [51, 51, 255], [0, 0, 204], [0, 0, 153], [0, 0, 102]],
		[[128, 0, 255], [230, 204, 255], [206, 153, 255], [181, 102, 255], [156, 51, 255], [105, 0, 204], [79, 0, 153], [53, 0, 102]],
		[[191, 0, 255], [242, 204, 255], [230, 153, 255], [217, 102, 255], [204, 51, 255], [153, 0, 204], [115, 0, 153], [77, 0, 102]],
	];

	const createPaletteGradients = (type: EFormatType, foramt: string, navigation: HTMLElement, colors: [number, number, number][][], bVertical: boolean = true): HTMLDivElement[] => {
		const paletteGradients = [];
		for (const standardColor of colors) {
			const gradient = DOM.Create('div', {
				attrs: {
					vertical: bVertical ? 'true' : 'false',
				},
				class: DOM.Utils.CreateUEID('item-group', false),
			});

			for (const color of standardColor) {
				const rgba = ColorPicker.Utils.RGBA.ToMap(...color);
				const colorElement = UI.CreateOption({
					Title: ColorPicker.Utils.RGBA.ToHex(rgba),
					Type: EFormatType.STYLE,
					Format: foramt,
					FormatValue: ColorPicker.Utils.RGBA.ToRGB(...color),
					UIName: EFormatUI.LI,
					UIType: EFormatUIType.ITEM,
					Html: '',
				}, false, () => {
					DOM.SetStyle(navigation, 'background-color', ColorPicker.Utils.RGBA.ToRGB(...color));
					DOM.Dispatch(navigation, 'color:change');
					UI.ToggleFormatCaret({ Type: type, Format: foramt, FormatValue: ColorPicker.Utils.RGBA.ToRGB(...color) });
				});

				const styleVariable = DOM.Utils.CreateStyleVariable(
					'toolbar-color-hover-border',
					rgba.Red === 255 && rgba.Green === 255 && rgba.Blue === 255 ? '#F2F2F2' : '#fff'
				);

				DOM.SetStyleText(colorElement, styleVariable);
				DOM.SetStyle(colorElement, 'background-color', ColorPicker.Utils.RGBA.ToRGB(...color));

				DOM.Insert(gradient, colorElement);
			}
			paletteGradients.push(gradient);
		}
		return paletteGradients;
	};

	const createPalette = (name: string, formatOption: Pick<IFormatPalette, 'Type' | 'Format' | 'DefaultColor' | 'LastPicked'>, wrapper: HTMLElement, navigation: HTMLElement) => {
		const { Type, Format, DefaultColor, LastPicked } = formatOption;
		const resetButton = UI.Create({
			Title: 'Default color',
			UIName: EFormatUI.LI,
			UIType: EFormatUIType.ITEM,
			Html: '<button><div></div><span>Default color</span></button>',
		}, () => {
			DOM.SetStyle(navigation, 'background-color', DefaultColor);
			DOM.Dispatch(navigation, 'color:change');
			UI.UnwrapFormatCaret({ Type: EFormatType.STYLE, Format });
		});

		const footer = UI.Create({
			Title: 'More...',
			UIName: EFormatUI.LI,
			UIType: EFormatUIType.ITEM,
			Html: `<div class="${DOM.Utils.CreateUEID('item-group', false)}"></div><button>${Finer.Icons.Get('Palette')}<span>More...</span></button>`,
		});

		DOM.On(DOM.Select('button', footer), ENativeEvents.click, () => {
			ColorPicker.Create({
				Icons: {
					Close: Finer.Icons.Get('Close')
				},
				Pick: (rgb: string) => {
					self.Focus();
					UI.ToggleFormatCaret({ Type, Format, FormatValue: rgb });
					DOM.SetStyle(navigation, 'background-color', rgb);
					DOM.Dispatch(navigation, 'color:change');
				}
			});
		});

		const lastPicked = DOM.Select(`.${DOM.Utils.CreateUEID('item-group', false)}`, footer);
		DOM.Insert(lastPicked, createPaletteGradients(Type, Format, navigation, [LastPicked], false));

		const palette = UI.CreateOptionList(name, [resetButton, ...createPaletteGradients(Type, Format, navigation, standardColors), footer]);
		DOM.SetAttr(palette, 'palette', 'true');

		DOM.Insert(self.Frame.Root, palette);
		UI.SetOptionListCoordinate(name, wrapper, palette);
	};

	const createHelper = (name: string, formatOption: Pick<IFormatPalette, 'Title' | 'Type' | 'Format' | 'DefaultColor' | 'LastPicked'>, wrapper: HTMLElement, navigation: HTMLElement) => {
		const { Title } = formatOption;

		const helper = UI.Create({
			Title,
			UIName: EFormatUI.DIV,
			UIType: EFormatUIType.HELPER,
			Html: Finer.Icons.Get('AngleDown'),
		});

		UI.CreateOptionEvent(name, helper, () => createPalette(name, formatOption, wrapper, navigation));

		return helper;
	};

	const Register = (name: string): HTMLElement | null => {
		if (!Arr.Contains(Object.keys(Formats), name)) return null;
		const formatOption = Formats[name];

		const colorNavigation = DOM.Create('div', {
			styles: {
				backgroundColor: formatOption.DefaultColor
			}
		});

		DOM.On(colorNavigation, 'color:change', () => {
			if (formatOption.LastPicked.length >= 5) formatOption.LastPicked.shift();
			const color = ColorPicker.Utils.RGBA.FromString(DOM.GetStyle(colorNavigation, 'background-color'));
			formatOption.LastPicked.push(color as [number, number, number]);
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
			UI.ToggleFormatCaret({ Type: formatOption.Type, Format: formatOption.Format, FormatValue: rgb });
		});

		const helper = createHelper(name, formatOption, wrapper, colorNavigation);
		DOM.Insert(button, colorNavigation);
		DOM.Insert(wrapper, [button, helper]);

		return wrapper;
	};

	return {
		Formats: Object.keys(Formats),
		Register,
	};
};

export default Color;