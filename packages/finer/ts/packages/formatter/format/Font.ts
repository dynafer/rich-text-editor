import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import { IFormatDetector } from '../FormatDetector';
import {
	ATTRIBUTE_TITLE, EFormatType, EFormatUI, IFormatOption,
	STANDARD_POINTS_FROM_PIXEL, STANDARD_PIXEL_FROM_POINTS, IFormatRegistryJoiner, EFormatUIType
} from '../FormatType';
import { IFormatUI } from '../FormatUI';
import { ConvertToDetectorValue, EscapeUselessStyleChars, FlipKeyValue, FORMAT_BASES, GetPrimaryValue, LabelConfiguration } from '../FormatUtils';

interface IFormatFont extends Pick<IFormatOption, 'Title' | 'Type' | 'Format' | 'SameOption' | 'UIName'> {
	ConfigName: string,
	FormatOptions: IFormatOption[],
	DefaultOptions: string[] | Record<string, string>,
}

interface IFormatGetValue {
	(detectedValue: string): string;
}

interface IDetectableOption {
	Name: string,
	Selection: HTMLElement,
	SetLabel: (text: string) => void,
}

const Font = (editor: Editor, formatDetector: IFormatDetector, formatUI: IFormatUI): IFormatRegistryJoiner => {
	const self = editor;
	const detector = formatDetector;
	const UI = formatUI;

	const Formats: Record<string, IFormatFont> = {
		fontsize: {
			...FORMAT_BASES.fontsize,
			UIName: EFormatUI.BUTTON,
			ConfigName: 'fontsize_options',
			FormatOptions: [],
			DefaultOptions: ['9pt', '10pt', '12pt', '18pt', '24pt', '48pt'],
		},
		fontfamily: {
			...FORMAT_BASES.fontfamily,
			UIName: EFormatUI.BUTTON,
			ConfigName: 'fontfamily_options',
			FormatOptions: [],
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
		}
	};

	const createGetStyleValue = (name: string, systemStyle: string, detectableStyleMap: Record<string, string>): IFormatGetValue =>
		(detectedValue: string) => {
			switch (name) {
				case 'fontfamily':
					return detectedValue === systemStyle ? 'System Font' : EscapeUselessStyleChars(detectedValue);
				case 'fontsize':
				default:
					const convertedValue = ConvertToDetectorValue(detectedValue);

					const bPixel = Str.Contains(convertedValue, 'px');
					const pixelOrPoint = bPixel ? 'pt' : 'px';
					const result = parseFloat(convertedValue.replace(pixelOrPoint, '') ?? 0)
						* (bPixel ? STANDARD_POINTS_FROM_PIXEL : STANDARD_PIXEL_FROM_POINTS);
					let convertedSize = Str.Merge(result.toString(), pixelOrPoint);

					if (detectableStyleMap[convertedSize]) return detectableStyleMap[convertedSize];

					convertedSize = Str.Merge(Math.round(result).toString(), pixelOrPoint);
					const convertedOpotionLabel = detectableStyleMap[convertedSize];

					return convertedOpotionLabel ? convertedOpotionLabel : EscapeUselessStyleChars(detectedValue);
			}
		};

	const createOptionsList = (detectedValue: string, formatOptions: IFormatOption[], detectable: IDetectableOption) => {
		const { Name, Selection, SetLabel } = detectable;

		const optionElements: Node[] = [];
		for (const option of formatOptions) {
			const { Format, FormatValue, Title } = option;
			const optionElement = UI.CreateOption(option, detectedValue === Title, SetLabel);
			if (Name === 'fontfamily') DOM.SetStyle(optionElement, Format, FormatValue ?? '');
			optionElements.push(optionElement);
		}

		const optionList = UI.CreateOptionList(Name, optionElements);
		DOM.Insert(self.Frame.Root, optionList);
		UI.SetOptionListCoordinate(Name, Selection, optionList);
	};

	const createUI = (name: string, formatOption: IFormatFont, label: HTMLElement, setLabel: (text: string) => void): HTMLElement => {
		const { UIName, Title, FormatOptions } = formatOption;
		const selection = UI.CreateSelection(UIName, Title, [label, Finer.Icons.Get('AngleDown')]);

		const detectable: IDetectableOption = { Name: name, Selection: selection, SetLabel: setLabel };

		UI.CreateOptionEvent(name, selection, () => createOptionsList(DOM.GetAttr(label, ATTRIBUTE_TITLE) ?? '', FormatOptions, detectable));

		return selection;
	};

	const createFormatOptions = (formatOption: IFormatFont, optionSettings: Record<string, string>): IFormatOption[] => {
		const { Format, SameOption } = formatOption;
		const formatOptions: IFormatOption[] = [];
		for (const [title, setting] of Object.entries(optionSettings)) {
			formatOptions.push({
				Title: title,
				Type: EFormatType.STYLE,
				Format: Format,
				FormatValue: setting,
				SameOption: SameOption,
				UIName: EFormatUI.LI,
				UIType: EFormatUIType.ITEM,
				Html: Str.Merge(Finer.Icons.Get('Check'), title)
			});
		}

		return formatOptions;
	};

	const Register = (name: string): HTMLElement | null => {
		if (!Arr.Contains(Object.keys(Formats), name)) return null;

		const formatOption = Formats[name];
		const config = self.Config[formatOption.ConfigName] as string[] | Record<string, string>;
		const optionSettings: Record<string, string> = LabelConfiguration(
			!config || (!Type.IsArray(config) && !Type.IsObject(config)) || (Type.IsArray(config) && Arr.IsEmpty(config))
				? formatOption.DefaultOptions : config
		);
		const detectableStyleMap = FlipKeyValue(optionSettings);
		const systemStyle = UI.GetSystemStyle(formatOption.Format);

		formatOption.FormatOptions = createFormatOptions(formatOption, optionSettings);

		const getStyleValue = createGetStyleValue(name, systemStyle, detectableStyleMap);

		const label = UI.CreateLabel();
		const setLabel = (text: string) => {
			if (Str.IsEmpty(text)) text = getStyleValue(systemStyle);
			DOM.SetAttr(label, ATTRIBUTE_TITLE, text);
			DOM.SetText(label, text);
		};

		const ui = createUI(name, formatOption, label, setLabel);

		setLabel(getStyleValue(systemStyle));

		detector.Register({ Type: formatOption.Type, Format: formatOption.Format }, (detectedNode: Node | null) => {
			const detectedValue = !detectedNode ? systemStyle : self.DOM.GetStyle(detectedNode as HTMLElement, formatOption.Format);
			if (systemStyle === detectedValue) {
				setLabel(getStyleValue(systemStyle));
				return;
			}

			const convertedValue = GetPrimaryValue(ConvertToDetectorValue(detectedValue));

			const optionLabel = detectableStyleMap[convertedValue];

			setLabel(detectedNode && optionLabel ? optionLabel : getStyleValue(detectedValue));
		}, true);

		return ui;
	};

	return {
		Formats: Object.keys(Formats),
		Register
	};
};

export default Font;