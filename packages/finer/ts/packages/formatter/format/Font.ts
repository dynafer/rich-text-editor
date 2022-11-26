import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import { ENativeEvents, PreventEvent } from '../../events/EventSetupUtils';
import FormatDetector from '../FormatDetector';
import {
	ATTRIBUTE_TITLE, EFormatType, EFormatUI, IFormatUIOptionBase, IFormatOption,
	STANDARD_POINTS_FROM_PIXEL, STANDARD_PIXEL_FROM_POINTS, IFormatRegistryJoiner, EFormatUIType
} from '../FormatType';
import FormatUI from '../FormatUI';
import { ConvertToDetectorValue, EscapeUselessStyleChars, FlipKeyValue, FORMAT_BASES, GetPrimaryValue, LabelConfiguration } from '../FormatUtils';

interface IFormatSelector extends Pick<IFormatUIOptionBase, 'Title' | 'Type' | 'Format' | 'SameOption'> {
	UIName: EFormatUI,
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

const Font = (editor: Editor): IFormatRegistryJoiner => {
	const self = editor;
	const detector = FormatDetector(self);
	const UI = FormatUI(self);

	const Formats: Record<string, IFormatSelector> = {
		fontsize: {
			...FORMAT_BASES.fontsize,
			UIName: EFormatUI.BUTTON,
			FormatOptions: [],
			DefaultOptions: ['9pt', '12pt', '18pt', '24pt', '48pt'],
		},
		fontfamily: {
			...FORMAT_BASES.fontfamily,
			UIName: EFormatUI.BUTTON,
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
					const convertedValue = ConvertToDetectorValue(detectedValue).trim();

					const bPixel = Str.Contains(Str.LowerCase(convertedValue), 'px');
					const replaced = parseFloat(Str.LowerCase(convertedValue).replace(bPixel ? 'px' : 'pt', '')) ?? 0;
					const convertedSize = `${replaced * (bPixel ? STANDARD_POINTS_FROM_PIXEL : STANDARD_PIXEL_FROM_POINTS)}${bPixel ? 'pt' : 'px'}`;

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
		DOM.Insert(optionList, optionElements);
		DOM.Insert(self.Frame.Root, optionList);
		UI.SetOptionListCoordinate(Name, Selection, optionList);
	};

	const createUI = (name: string, formatOption: IFormatSelector, label: HTMLElement, setLabel: (text: string) => void) => {
		const { UIName, Title, FormatOptions } = formatOption;
		const selection = UI.CreateSelection(UIName, Title, [label, Finer.Icons.Get('AngleDown')]);

		const detectable: IDetectableOption = { Name: name, Selection: selection, SetLabel: setLabel };

		const destroyOptionList = () => {
			DOM.Off(self.Frame.Toolbar, ENativeEvents.scroll, destroyOptionList);
			DOM.Off(DOM.Doc.body, ENativeEvents.click, destroyOptionList);
			self.DOM.Off(self.DOM.GetRoot(), ENativeEvents.click, destroyOptionList);
			DOM.Off(DOM.Win, ENativeEvents.scroll, destroyOptionList);
			DOM.Off(DOM.Win, ENativeEvents.resize, destroyOptionList);
			UI.DestroyOptionList();
		};

		DOM.On(selection, ENativeEvents.click, (event: MouseEvent) => {
			if (UI.ExistsOptionList() && UI.HasTypeAttribute(name)) return destroyOptionList();
			PreventEvent(event);

			destroyOptionList();
			createOptionsList(DOM.GetAttr(label, ATTRIBUTE_TITLE) ?? '', FormatOptions, detectable);
			DOM.On(self.Frame.Toolbar, ENativeEvents.scroll, destroyOptionList);
			DOM.On(DOM.Doc.body, ENativeEvents.click, destroyOptionList);
			self.DOM.On(self.DOM.GetRoot(), ENativeEvents.click, destroyOptionList);
			DOM.On(DOM.Win, ENativeEvents.scroll, destroyOptionList);
			DOM.On(DOM.Win, ENativeEvents.resize, destroyOptionList);
		});

		self.Toolbar.Add(name, selection);
	};

	const createFormatOptions = (formatOption: IFormatSelector, optionSettings: Record<string, string>): IFormatOption[] => {
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
				Html: `${Finer.Icons.Get('Check')}${title}`
			});
		}

		return formatOptions;
	};

	const Register = (name: string) => {
		if (!Arr.Contains(Object.keys(Formats), name)) return;

		const formatOption = Formats[name];
		const config = self.Config[name] as string[] | Record<string, string>;
		const optionSettings: Record<string, string> = LabelConfiguration(
			!config || (!Type.IsArray(config) && !Type.IsObject(config)) || !(Type.IsArray(config) && !Arr.IsEmpty(config))
				? formatOption.DefaultOptions : config
		);
		const detectableStyleMap = FlipKeyValue(optionSettings);
		const systemStyle = UI.GetSystemStyle(formatOption.Format);

		formatOption.FormatOptions = createFormatOptions(formatOption, optionSettings);

		const label = UI.CreateLabel();
		const setLabel = (text: string) => {
			DOM.SetAttr(label, ATTRIBUTE_TITLE, text);
			DOM.SetText(label, text);
		};
		const getStyleValue = createGetStyleValue(name, systemStyle, detectableStyleMap);

		createUI(name, formatOption, label, setLabel);

		setLabel(getStyleValue(systemStyle));

		detector.Register({ Type: formatOption.Type, Format: formatOption.Format }, (detectedNode: Node | null) => {
			const detectedValue = !detectedNode ? systemStyle : self.DOM.GetStyle(detectedNode as HTMLElement, formatOption.Format);
			const convertedValue = GetPrimaryValue(ConvertToDetectorValue(detectedValue));

			const optionLabel = detectableStyleMap[convertedValue];

			setLabel(detectedNode && optionLabel ? optionLabel : getStyleValue(detectedValue));
		});
	};

	return {
		Formats: Object.keys(Formats),
		Register
	};
};

export default Font;