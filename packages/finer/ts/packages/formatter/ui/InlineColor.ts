import ColorPicker from '@dynafer/colorpicker';
import { Arr, Obj, Str } from '@dynafer/utils';
import DOM from '../../dom/DOM';
import Editor from '../../Editor';
import { Formats, ListItemSelector } from '../Format';
import ToggleInline from '../format/ToggleInline';
import { IFormatDetector } from '../FormatDetector';
import { IFormatUIRegistryUnit, IInlineFormat } from '../FormatType';
import FormatUI from '../FormatUI';
import FormatUtils from '../FormatUtils';

type TRGBArray = [number, number, number];

interface IInlineFormatColorPickerUI {
	Format: IInlineFormat,
	Title: string,
	LastPicked: TRGBArray[],
	Icon: string,
	DefaultColor: string,
}

const InlineColor = (editor: Editor, detector: IFormatDetector): IFormatUIRegistryUnit => {
	const self = editor;
	const Detector = detector;

	const ColorFormats: Record<string, IInlineFormatColorPickerUI> = {
		ForeColor: {
			Format: Formats.ForeColor as IInlineFormat,
			Title: 'Text color',
			DefaultColor: ColorPicker.Utils.RGBA.ToRGB(255, 0, 0),
			Icon: 'ColorA',
			LastPicked: [],
		},
		BackColor: {
			Format: Formats.BackColor as IInlineFormat,
			Title: 'Back color',
			DefaultColor: ColorPicker.Utils.RGBA.ToRGB(255, 0, 0),
			Icon: 'Fill',
			LastPicked: [],
		},
	};

	const UINames = Obj.Keys(ColorFormats);

	// color, lighter 40%, lighter 30%, lighter 20%, lighter 10%, darker 10%, darker 20%, darker 30%
	const STANDARD_PALETTE: TRGBArray[][] = [
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

	const createCommand = (format: IInlineFormat, navigation: HTMLElement) =>
		<T = boolean | string>(bActive: T, rgb: T) => {
			const toggler = ToggleInline(self, format);
			toggler.ToggleFromCaret(bActive as boolean, bActive ? rgb as string : undefined);
			DOM.SetStyle(navigation, 'background-color', rgb as string);
			DOM.Dispatch(navigation, 'Color:Change');
		};

	const createPaletteGradients = (uiName: string, colors: TRGBArray[][], bVertical: boolean = true): HTMLElement[] => {
		const paletteGradients: HTMLElement[] = [];
		Arr.Each(colors, standardColor => {
			const gradient = FormatUI.CreateItemGroup();
			DOM.SetAttr(gradient, 'vertical', bVertical ? 'true' : 'false');

			Arr.Each(standardColor, color => {
				const rgba = ColorPicker.Utils.RGBA.ToMap(...color);
				const rgbaString = ColorPicker.Utils.RGBA.ToRGB(...color);
				const colorElement = FormatUI.Create({
					tagName: ListItemSelector,
					title: ColorPicker.Utils.RGBA.ToHex(rgba),
					type: 'option-item'
				});
				DOM.SetStyle(colorElement, 'background-color', rgbaString);
				FormatUI.BindClickEvent(colorElement, () => FormatUI.RunCommand<boolean | string>(self, uiName, true, rgbaString));

				const styleVariable = DOM.Utils.CreateStyleVariable(
					'toolbar-color-hover-border',
					rgba.Red === 255 && rgba.Green === 255 && rgba.Blue === 255 ? '#F2F2F2' : '#fff'
				);

				DOM.SetStyleText(colorElement, styleVariable);
				DOM.SetStyle(colorElement, 'background-color', rgbaString);

				DOM.Insert(gradient, colorElement);
			});
			Arr.Push(paletteGradients, gradient);
		});

		return paletteGradients;
	};

	const createResetButton = (uiName: string, uiFormat: IInlineFormatColorPickerUI): HTMLElement => {
		const { DefaultColor } = uiFormat;

		const defaultColorText = 'Default color';
		const defaultColorHTML = DOM.Utils.WrapTagHTML('button', Str.Merge(
			DOM.Utils.WrapTagHTML('div', ''),
			DOM.Utils.WrapTagHTML('span', defaultColorText)
		));

		const resetButton = FormatUI.CreateOption(defaultColorHTML, defaultColorText, false, false);

		FormatUI.BindClickEvent(DOM.Select<HTMLElement>('button', resetButton), () => FormatUI.RunCommand<boolean | string>(self, uiName, false, DefaultColor));

		return resetButton;
	};

	const createFooter = (uiName: string, uiFormat: IInlineFormatColorPickerUI): HTMLElement => {
		const { LastPicked } = uiFormat;

		const moreText = 'More...';

		const footer = FormatUI.CreateOption('', moreText, false, false);
		const lastPickedList = FormatUI.CreateItemGroup();
		const moreButton = FormatUI.Create({ tagName: 'button' });
		DOM.SetHTML(moreButton, Str.Merge(
			Finer.Icons.Get('Palette'),
			DOM.Utils.WrapTagHTML('span', moreText)
		));
		DOM.Insert(footer, lastPickedList, moreButton);

		FormatUI.BindClickEvent(moreButton, () =>
			ColorPicker.Create({
				Icons: {
					Close: Finer.Icons.Get('Close')
				},
				Pick: (rgb: string) => FormatUI.RunCommand<boolean | string>(self, uiName, true, rgb),
			}));

		DOM.Insert(lastPickedList, ...createPaletteGradients(uiName, [LastPicked], false));

		return footer;
	};

	const createPalette = (uiName: string, uiFormat: IInlineFormatColorPickerUI, wrapper: HTMLElement) => {
		const resetButton = createResetButton(uiName, uiFormat);
		const footer = createFooter(uiName, uiFormat);

		const palette = FormatUI.CreateOptionList(uiName, [resetButton, ...createPaletteGradients(uiName, STANDARD_PALETTE), footer]);
		DOM.SetAttr(palette, 'palette', 'true');

		DOM.Insert(self.Frame.Root, palette);
		FormatUI.SetOptionListCoordinate(self, uiName, wrapper, palette);
	};

	const createHelper = (uiName: string, uiFormat: IInlineFormatColorPickerUI, wrapper: HTMLElement): HTMLElement => {
		const { Title } = uiFormat;

		const helper = FormatUI.CreateHelper(Title);

		FormatUI.BindOptionListEvent(self, uiName, wrapper, helper, () => createPalette(uiName, uiFormat, wrapper));

		return helper;
	};

	const Create = (name: string): HTMLElement => {
		const uiName = FormatUtils.GetFormatName(name, UINames);
		const uiFormat = ColorFormats[uiName];

		const colorNavigation = FormatUI.Create({ tagName: 'div' });
		DOM.SetStyle(colorNavigation, 'background-color', uiFormat.DefaultColor);

		const command = createCommand(uiFormat.Format, colorNavigation);
		FormatUI.RegisterCommand(self, uiName, command);

		DOM.On(colorNavigation, 'Color:Change', () => {
			if (uiFormat.LastPicked.length >= 5) Arr.Shift(uiFormat.LastPicked);
			const color = ColorPicker.Utils.RGBA.FromString(DOM.GetStyle(colorNavigation, 'background-color'));
			Arr.Push(uiFormat.LastPicked, color as TRGBArray);
		});

		const wrapper = FormatUI.CreateIconWrap(uiFormat.Title);

		const button = FormatUI.Create({
			tagName: 'button',
			title: uiFormat.Title,
			type: 'color-icon',
		});
		DOM.SetHTML(button, Finer.Icons.Get(uiFormat.Icon));
		FormatUI.BindClickEvent(button, () => FormatUI.RunCommand<boolean | string>(self, uiName, true, DOM.GetStyle(colorNavigation, 'background-color')));

		const helper = createHelper(uiName, uiFormat, wrapper);
		DOM.Insert(button, colorNavigation);
		DOM.Insert(wrapper, button, helper);

		Detector.Register((paths: Node[]) =>
			FormatUI.IsNearDisableList(uiFormat.Format.DisableList, wrapper, FormatUtils.GetParentIfText(paths[0]))
		);

		return wrapper;
	};

	return {
		UINames,
		Create,
	};
};

export default InlineColor;