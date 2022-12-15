import { Str, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
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
	ConfigName: string,
	Options: Record<string, string>,
}

const InlineFont = (editor: Editor, detector: IFormatDetector): IFormatUIRegistryUnit => {
	const self = editor;
	const Detector = detector;

	const FONT_SIZE_REGEXP = /[\d]+(px|pt)/gi;

	const FontFormats: Record<string, IInlineFormatFontUI> = {
		FontSize: {
			Format: Formats.FontSize as IInlineFormat,
			Title: 'Font size',
			bPreview: false,
			DefaultOptions: ['9pt', '10pt', '12pt', '18pt', '24pt', '48pt'],
			ConfigName: 'FontSizeOptions',
			Options: {},
		},
		FontFamily: {
			Format: Formats.FontFamily as IInlineFormat,
			Title: 'Font family',
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

	const UINames = Object.keys(FontFormats);

	const getFirstValue = (value: string): string => value.split(',')[0].replace(/["`';]/gi, '');

	const isDetected = (format: IInlineFormat, nodes: Node[], value: string): boolean => {
		const { Styles } = format;
		if (!Styles) return false;

		const selector = FormatUtils.GetStyleSelector(Styles);
		const styleName = Object.keys(Styles as object)[0];

		const bNumber = Str.Contains(value, FONT_SIZE_REGEXP);

		const convertedValue = bNumber
			? (Str.Contains(value, 'pt') ? FormatUtils.ConvertPointsToPixel(parseFloat(value)) : value)
			: getFirstValue(value);

		const checkDetected = (element: HTMLElement | null): boolean => {
			if (!element) return false;
			const detectedValue = getFirstValue(self.DOM.GetStyle(element, styleName, bNumber));

			if (Str.LowerCase(detectedValue) === Str.LowerCase(convertedValue.toString())) return true;
			if (parseFloat(detectedValue) === convertedValue) return true;

			return false;
		};

		for (const node of nodes) {
			const detected = self.DOM.ClosestByStyle(node as Element, selector) as HTMLElement;

			if (checkDetected(detected)) return true;
		}

		return checkDetected(self.GetBody());
	};

	const createOptionElements = (uiFormat: IInlineFormatFontUI, labelValue: string, setLabelText: (value: string) => void): HTMLElement[] => {
		const { Format, bPreview, Options } = uiFormat;
		const optionElements: HTMLElement[] = [];

		const styleName = !Format.Styles ? '' : Object.keys(Format.Styles)[0];

		for (const [label, value] of Object.entries(Options)) {
			const html = bPreview ? DOM.Utils.WrapTagHTML('span', label) : label;
			const bSelected = label === labelValue;
			const optionElement = FormatUI.CreateOption(html, label, bSelected);
			FormatUI.BindClickEvent(optionElement, () => {
				const toggler = ToggleInline(self, Format);
				toggler.ToggleFromCaret(!bSelected, value);
				if (!bSelected) FormatUI.UnwrapSameInlineFormats(self, Format);
				setLabelText(!bSelected ? label : '');
			});

			if (bPreview && Format.Styles) DOM.SetStyle(DOM.Select('span', optionElement) as HTMLElement, styleName, value);

			optionElements.push(optionElement);
		}

		return optionElements;
	};

	const createOptionsList = (selection: IFormatUISelection, uiName: string, optionElements: HTMLElement[]) => {
		const optionList = FormatUI.CreateOptionList(uiName, optionElements);
		DOM.Insert(self.Frame.Root, optionList);
		FormatUI.SetOptionListCoordinate(self, uiName, selection.Selection, optionList);
	};

	const getCurrentStyle = (format: IInlineFormat, options: Record<string, string>, node: Node): string => {
		for (const [label, value] of Object.entries(options)) {
			if (!isDetected(format, [node], value)) continue;

			return label;
		}

		return '';
	};

	const Create = (name: string): HTMLElement => {
		const uiName = FormatUtils.GetFormatName(name, UINames);
		const uiFormat = FontFormats[uiName];

		const selection = FormatUI.CreateSelection(Str.CapitalToSpace(uiName));
		const config = FormatUtils.GetFormatConfig(self, uiFormat.DefaultOptions, uiFormat.ConfigName);
		const labelledConfig = Type.IsArray(config) ? FormatUtils.LabelConfigArray(config) : config as Record<string, string>;

		uiFormat.Options = labelledConfig;

		const systemStyle = getCurrentStyle(uiFormat.Format, uiFormat.Options, self.GetBody());
		const defaultValue = uiName === 'FontFamily' ? 'Default Font' : systemStyle;

		const setLabelText = (value?: string) => {
			if (!value || Str.IsEmpty(value) || value === systemStyle) return DOM.SetText(selection.Label, defaultValue);
			DOM.SetText(selection.Label, value);
		};

		FormatUI.BindOptionListEvent(self, uiName, selection.Selection, () => {
			const optionElements = createOptionElements(uiFormat, DOM.GetText(selection.Label), setLabelText);
			createOptionsList(selection, uiName, optionElements);
		});

		setLabelText(systemStyle);

		Detector.Register((paths: Node[]) => {
			const node = FormatUtils.GetParentIfText(paths[0]);

			setLabelText(getCurrentStyle(uiFormat.Format, uiFormat.Options, node));
		});

		return selection.Selection;
	};

	return {
		UINames,
		Create,
	};
};

export default InlineFont;