import { Arr, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import { ENativeEvents } from '../../events/EventSetupUtils';
import FormatDetector from '../FormatDetector';
import {
	ATTRIBUTE_TITLE, EFormatType, EFormatUI, IFormatUIOptionBase, IFormatOption,
	STANDARD_POINTS_FROM_PIXEL, STANDARD_PIXEL_FROM_POINTS, IFormatRegistryJoiner, EFormatUIType
} from '../FormatType';
import FormatUI from '../FormatUI';
import { ConvertToDetectorValue, EscapeUselessStyleChars, FlipKeyValue, FORMAT_BASES, GetPrimaryValue, LabelConfiguration } from '../FormatUtils';

interface IFormatSelector extends Pick<IFormatUIOptionBase, 'label' | 'type' | 'format' | 'sameOption'> {
	formatOptions: IFormatOption[],
	defaultOptions: string[] | Record<string, string>,
}

interface IFormatGetValue {
	(detectedValue: string): string;
}

interface IDetectableOption {
	name: string,
	selection: HTMLElement,
	setLabel: (text: string) => void,
}

const Font = (editor: Editor): IFormatRegistryJoiner => {
	const self = editor;
	const detector = FormatDetector(self);
	const UI = FormatUI(self);

	const Formats: Record<string, IFormatSelector> = {
		fontsize: {
			...FORMAT_BASES.fontsize,
			formatOptions: [],
			defaultOptions: ['9pt', '12pt', '18pt', '24pt', '48pt'],
		},
		fontfamily: {
			...FORMAT_BASES.fontfamily,
			formatOptions: [],
			defaultOptions: {
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

					const bPixel = convertedValue.toLowerCase().includes('px');
					const replaced = parseFloat(convertedValue.toLowerCase().replace(bPixel ? 'px' : 'pt', '')) ?? 0;
					const convertedSize = `${replaced * (bPixel ? STANDARD_POINTS_FROM_PIXEL : STANDARD_PIXEL_FROM_POINTS)}${bPixel ? 'pt' : 'px'}`;

					const convertedOpotionLabel = detectableStyleMap[convertedSize];

					return convertedOpotionLabel ? convertedOpotionLabel : EscapeUselessStyleChars(detectedValue);
			}
		};

	const createOptionsWrapper = (detectedValue: string, formatOptions: IFormatOption[], detectable: IDetectableOption) => {
		const { name, selection, setLabel } = detectable;

		const optionElements: Node[] = [];
		for (const option of formatOptions) {
			const { formatValue, label } = option;
			const optionElement = UI.CreateOption(option, detectedValue === label, setLabel);
			if (name === 'fontfamily') DOM.SetStyle(optionElement, option.format, formatValue ?? '');
			optionElements.push(optionElement);
		}

		const optionWrapper = UI.CreateOptionWrapper(name, optionElements);
		DOM.Insert(optionWrapper, optionElements);
		DOM.SetStyles(optionWrapper, {
			left: `${selection.offsetLeft}px`,
			top: `${selection.offsetHeight + selection.offsetTop}px`
		});

		DOM.Insert(self.Frame.Root, optionWrapper);
	};

	const createUI = (name: string, formatOption: IFormatSelector, labelWrapper: HTMLElement, setLabel: (text: string) => void) => {
		const { label, formatOptions } = formatOption;
		const selection = UI.CreateSelection(label, [labelWrapper, Finer.Icons.Get('AngleDown')]);

		DOM.Insert(self.Frame.Toolbar, selection);

		const detectable: IDetectableOption = { name, selection, setLabel };

		const destroyOptionWrapper = () => {
			DOM.Off(DOM.Doc.body, ENativeEvents.click, destroyOptionWrapper);
			self.DOM.Off(self.DOM.GetRoot(), ENativeEvents.click, destroyOptionWrapper);
			UI.DestroyOptionWrapper();
		};

		DOM.On(selection, ENativeEvents.click, (event: MouseEvent) => {
			if (UI.ExistsOptionWrapper() && UI.HasTypeAttribute(name)) return destroyOptionWrapper();
			event.stopImmediatePropagation();
			event.stopPropagation();
			event.preventDefault();

			destroyOptionWrapper();
			createOptionsWrapper(DOM.GetAttr(labelWrapper, ATTRIBUTE_TITLE) ?? '', formatOptions, detectable);
			DOM.On(DOM.Doc.body, ENativeEvents.click, destroyOptionWrapper);
			self.DOM.On(self.DOM.GetRoot(), ENativeEvents.click, destroyOptionWrapper);
		});
	};

	const createFormatOptions = (formatOption: IFormatSelector, options: Record<string, string>) => {
		const { format, sameOption } = formatOption;
		const formatOptions: IFormatOption[] = [];
		for (const [label, option] of Object.entries(options)) {
			formatOptions.push({
				label: label,
				type: EFormatType.STYLE,
				format: format,
				formatValue: option,
				sameOption: sameOption,
				ui: EFormatUI.LI,
				uiType: EFormatUIType.ITEM,
				html: `${Finer.Icons.Get('Check')}${label}`
			});
		}

		return formatOptions;
	};

	const Register = (name: string) => {
		if (!Object.keys(Formats).includes(name)) return;

		const formatOption = Formats[name];
		const config = self.Config[name] as string[] | Record<string, string>;
		const options: Record<string, string> = LabelConfiguration(
			!config || (!Type.IsArray(config) && !Type.IsObject(config)) || !(Type.IsArray(config) && !Arr.IsEmpty(config))
				? formatOption.defaultOptions : config
		);
		const detectableStyleMap = FlipKeyValue(options);
		const systemStyle = UI.GetSystemStyle(formatOption.format);

		formatOption.formatOptions = createFormatOptions(formatOption, options);

		const labelWrapper = UI.CreateLabel();
		const setLabel = (text: string) => {
			DOM.SetAttr(labelWrapper, ATTRIBUTE_TITLE, text);
			DOM.SetText(labelWrapper, text);
		};
		const getStyleValue = createGetStyleValue(name, systemStyle, detectableStyleMap);

		createUI(name, formatOption, labelWrapper, setLabel);

		setLabel(getStyleValue(systemStyle));

		detector.Register({ type: formatOption.type, format: formatOption.format }, (detectedNode: Node | null) => {
			const detectedValue = !detectedNode ? systemStyle : self.DOM.GetStyle(detectedNode as HTMLElement, formatOption.format);
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