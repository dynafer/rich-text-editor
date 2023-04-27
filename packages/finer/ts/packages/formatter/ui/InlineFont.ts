import { Arr, Obj, Str, Type } from '@dynafer/utils';
import DOM from '../../dom/DOM';
import Editor from '../../Editor';
import { Formats } from '../Format';
import ToggleInline from '../format/ToggleInline';
import { IFormatDetector } from '../FormatDetector';
import { IFormatUIRegistryUnit, IInlineFormat } from '../FormatType';
import FormatUI, { IFormatUISelection } from '../FormatUI';
import FormatUtils from '../FormatUtils';

interface IInlineFormatFontUI {
	Format: IInlineFormat,
	Title: string,
	DefaultOptions: string[] | Record<string, string>,
	bPreview: boolean,
	ConfigName: Capitalize<string>,
	Options: Record<string, string>,
}

const InlineFont = (editor: Editor, detector: IFormatDetector): IFormatUIRegistryUnit => {
	const self = editor;
	const Detector = detector;

	const FONT_SIZE_REGEXP = /[\d]+(px|pt)/gi;

	const FontFormats: Record<string, IInlineFormatFontUI> = {
		FontSize: {
			Format: Formats.FontSize as IInlineFormat,
			Title: self.Lang('format.fontSize', 'Font size'),
			bPreview: false,
			DefaultOptions: ['9pt', '10pt', '12pt', '18pt', '24pt', '48pt'],
			ConfigName: 'FontSizeOptions',
			Options: {},
		},
		FontFamily: {
			Format: Formats.FontFamily as IInlineFormat,
			Title: self.Lang('format.fontFamily', 'Font family'),
			bPreview: true,
			DefaultOptions: {
				Arial: 'arial, sans-serif',
				'Arial Black': 'arial black, sans-serif',
				'Courier New': 'courier new, monospace',
				Georgia: 'georgia, serif',
				Helvetica: 'helvetica, sans-serif',
				'Lucida Console': 'lucida console',
				Monaco: 'monaco',
				'Noto Sans': 'noto sans, sans-serif',
				'Times New Soman': 'times new roman, serif',
				Verdana: 'verdana, sans-serif'
			},
			ConfigName: 'FontFamilyOptions',
			Options: {},
		},
	};

	const UINames = Obj.Keys(FontFormats);

	const getFirstValue = (value: string): string => value.split(',')[0].replace(/["`';]/gi, '');

	const isDetected = (format: IInlineFormat, nodes: Node[], value: string): boolean => {
		const { Styles } = format;
		if (!Styles) return false;

		const selector = FormatUtils.GetStyleSelectorMap(Styles);
		const styleName = Obj.Keys(Styles)[0];

		const bNumber = Str.Contains(value, FONT_SIZE_REGEXP);

		const convertedValue = bNumber
			? (Str.Contains(value, 'pt') ? FormatUtils.ConvertPointsToPixel(parseFloat(value)) : value)
			: getFirstValue(value);

		const checkDetected = (element: Element | null, bBody: boolean = false): boolean => {
			if (!element) return false;
			const detectedValue = getFirstValue(DOM.GetStyle(element, styleName, bBody));

			const numberValue = Str.Contains(detectedValue, 'pt')
				? FormatUtils.ConvertPointsToPixel(parseFloat(detectedValue))
				: parseFloat(detectedValue);

			return Str.LowerCase(detectedValue) === Str.LowerCase(convertedValue)
				|| (!bNumber ? false : numberValue === convertedValue);
		};

		for (let index = 0, length = nodes.length; index < length; ++index) {
			const node = nodes[index];
			const detected = DOM.ClosestByStyle(FormatUtils.GetParentIfText(node), selector);
			if (checkDetected(detected)) return true;

			if (node === self.GetBody()) return checkDetected(self.GetBody(), true);
		}

		return false;
	};

	const createCommand = (format: IInlineFormat, label: string, value: string, setLabelText: (value: string) => void) =>
		(bActive: boolean) => {
			const toggler = ToggleInline(self, format);
			if (bActive) FormatUI.UnwrapSameInlineFormats(self, format);
			toggler.ToggleFromCaret(bActive, value);
			setLabelText(bActive ? label : '');
		};

	const createOptionElements = (uiName: string, uiFormat: IInlineFormatFontUI, labelValue: string, setLabelText: (value: string) => void): HTMLElement[] => {
		const { Format, bPreview, Options } = uiFormat;
		const optionElements: HTMLElement[] = [];

		const styleName = !Format.Styles ? '' : Obj.Keys(Format.Styles)[0];

		Obj.Entries(Options, (label, value) => {
			const html = bPreview ? DOM.Utils.WrapTagHTML('span', label) : label;
			const bSelected = label === labelValue;
			const optionElement = FormatUI.CreateOption(html, label, bSelected);
			const command = createCommand(Format, label, value, setLabelText);

			FormatUI.RegisterCommand(self, uiName, command);
			FormatUI.BindClickEvent(optionElement, () => {
				FormatUI.DestoryOpenedOptionList(self);
				command(!bSelected);
			});

			if (bPreview && Format.Styles) DOM.SetStyle(DOM.Select<HTMLElement>('span', optionElement), styleName, value);

			Arr.Push(optionElements, optionElement);
		});

		return optionElements;
	};

	const createOptionsList = (selection: IFormatUISelection, uiName: string, optionElements: HTMLElement[]): HTMLElement => {
		const optionList = FormatUI.CreateOptionList(uiName, optionElements);
		DOM.Insert(self.Frame.Root, optionList);
		FormatUI.SetOptionListCoordinate(self, uiName, selection.Selection, optionList);
		return optionList;
	};

	const getCurrentStyle = (format: IInlineFormat, options: Record<string, string>, nodes: Node[]): string => {
		const optionEntries = Obj.Entries(options);
		for (let index = 0, length = optionEntries.length; index < length; ++index) {
			const [label, value] = optionEntries[index];
			if (!isDetected(format, nodes, value)) continue;

			return label;
		}

		return '';
	};

	const Create = (name: string): HTMLElement => {
		const uiName = FormatUtils.GetFormatName(name, UINames);
		const uiFormat = FontFormats[uiName];

		const selection = FormatUI.CreateSelection(uiFormat.Title);
		const config = FormatUtils.GetFormatConfig(self, uiFormat.DefaultOptions, uiFormat.ConfigName);
		const labelledConfig = Type.IsArray(config) ? FormatUtils.LabelConfigArray(config) : config as Record<string, string>;

		uiFormat.Options = labelledConfig;

		const systemStyle = getCurrentStyle(uiFormat.Format, uiFormat.Options, [self.GetBody()]);
		const defaultValue = uiName === 'FontFamily' ? (self.Lang('format.font.default', 'Default Font')) : systemStyle;

		const setLabelText = (value?: string) =>
			DOM.SetText(selection.Label, (!value || Str.IsEmpty(value)) ? defaultValue : value);

		FormatUI.BindOptionListEvent(self, {
			type: uiName,
			activable: selection.Selection,
			clickable: selection.Selection,
			create: () => {
				const optionElements = createOptionElements(uiName, uiFormat, DOM.GetText(selection.Label), setLabelText);
				return createOptionsList(selection, uiName, optionElements);
			}
		});

		setLabelText();

		Detector.Register((paths: Node[]) => {
			setLabelText(getCurrentStyle(uiFormat.Format, uiFormat.Options, paths));

			const node = FormatUtils.GetParentIfText(paths[0]);
			FormatUI.IsNearDisableList(uiFormat.Format.DisableList, selection.Selection, node);
		});

		return selection.Selection;
	};

	return {
		UINames,
		Create,
	};
};

export default InlineFont;