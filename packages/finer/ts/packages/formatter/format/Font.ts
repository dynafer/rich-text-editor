import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import { ENativeEvents } from '../../events/EventSetupUtils';
import * as Icons from '../../icons/Icons';
import FormatDetector from '../FormatDetector';
import {
	ATTRIBUTE_DATA_VALUE, EFormatType, EFormatUI, IFormatOptionBase, IFormatOption, IFormatDetectorActivator,
	STANDARD_POINTS_FROM_PIXEL, STANDARD_PIXEL_FROM_POINTS, IFormatRegistryJoiner, EFormatUIType
} from '../FormatType';
import FormatUI from '../FormatUI';

interface IFormatSelector extends Pick<IFormatOptionBase, 'type' | 'format'> {
	formatOptions: IFormatOption[],
	defaultOptions: string[] | Record<string, string>,
}

interface IFormatGetValue {
	(detectedValue: string): string;
}

interface IDetectableOption {
	name: string,
	selection: HTMLElement,
	detectableStyleMap: Record<string, string>,
	systemStyle: string,
	setLabel: (text: string) => void,
	getValue: IFormatGetValue,
}

const Font = (editor: Editor): IFormatRegistryJoiner => {
	const self = editor;
	const detector = FormatDetector(self);
	const UI = FormatUI(self);

	const Formats: Record<string, IFormatSelector> = {
		fontsize: {
			type: EFormatType.STYLE,
			format: 'font-size',
			formatOptions: [],
			defaultOptions: ['9pt', '12pt', '18pt', '24pt', '48pt'],
		},
		fontfamily: {
			type: EFormatType.STYLE,
			format: 'font-family',
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
	
	const escapeUnnecessaryChars = (value: string) => value.replace(/["`';]/g, '');
	const convertToDetecterValue = (value: string) => escapeUnnecessaryChars(value).toLowerCase();
	const getSystemStyle = (style: string) => self.DOM.GetStyle(self.GetBody(), style);
	const convertFontSize = (size: string): string => {
		const bPixel = size.toLowerCase().includes('px');
		const replaced = parseFloat(size.toLowerCase().replace(bPixel ? 'px' : 'pt', '')) ?? 0;
		return `${replaced * (bPixel ? STANDARD_POINTS_FROM_PIXEL : STANDARD_PIXEL_FROM_POINTS)}${bPixel ? 'pt' : 'px'}`;
	};

	const getPrimaryValue = (value: string) => value.split(',')[0].trim();

	const convertOptionsKeyValue = (options: Record<string, string>): Record<string, string> => {
		const newOptions: Record<string, string> = {};
		for (const [label, option] of Object.entries(options)) {
			newOptions[getPrimaryValue(option)] = label;
		}
		return newOptions;
	};

	const setLabelText = (label: HTMLElement) => (text: string) => {
		DOM.SetAttr(label, ATTRIBUTE_DATA_VALUE, text);
		DOM.SetText(label, text);
	};
	const getLabelText = (bActive: boolean, detected: string, detectable: IDetectableOption) => {
		const { systemStyle, detectableStyleMap, getValue } = detectable;

		const detectedValue = !bActive || Str.IsEmpty(detected) ? systemStyle : detected;
		const convertedValue = getPrimaryValue(convertToDetecterValue(detectedValue));

		const optionLabel = detectableStyleMap[convertedValue];

		return bActive && optionLabel ? optionLabel : getValue(detectedValue);
	};

	const activate = (detectable: IDetectableOption): IFormatDetectorActivator =>
		(bActive: boolean, detected: string) => detectable.setLabel(getLabelText(bActive, detected, detectable));

	const convertProperOptions = (options: string[] | Record<string, string>): Record<string, string> => {
		const newOptions: Record<string, string> = {};
		if (Type.IsArray(options)) {
			for (const option of options) {
				newOptions[escapeUnnecessaryChars(option)] = convertToDetecterValue(option).toLowerCase();
			}
		} else {
			for (const [label, option] of Object.entries(options)) {
				newOptions[escapeUnnecessaryChars(label)] = convertToDetecterValue(option).toLowerCase();
			}
		}

		return newOptions;
	};

	const setOptions = (config: string[] | Record<string, string>, defaultOptions: string[] | Record<string, string>): Record<string, string> =>
		convertProperOptions(
			!config || (!Type.IsArray(config) && !Type.IsObject(config)) || !(Type.IsArray(config) && !Arr.IsEmpty(config))
				? defaultOptions
				: config
		);

	const getFontSize = (detectableStyleMap: Record<string, string>): IFormatGetValue =>
		(detectedValue: string) => {
			const convertedValue = getPrimaryValue(convertToDetecterValue(detectedValue));

			const convertedSize = convertFontSize(convertedValue);
			const convertedOpotionLabel = detectableStyleMap[convertedSize];

			return convertedOpotionLabel ? convertedOpotionLabel : escapeUnnecessaryChars(detectedValue);
		};

	const getFontFamily = (systemStyle: string): IFormatGetValue =>
		(detectedValue: string) => detectedValue === systemStyle ? 'System Font' : escapeUnnecessaryChars(detectedValue);

	const createGetValue = (
		name: string,
		systemStyle: string,
		detectableStyleMap: Record<string, string>
	): IFormatGetValue => {
		switch (name) {
			case 'fontsize':
				return getFontSize(detectableStyleMap);
			case 'fontfamily':
			default:
				return getFontFamily(systemStyle);
		}
	};

	const createOptionsWrapper = (detectedValue: string, formatOptions: IFormatOption[], detectable: IDetectableOption) => {
		const { name, selection, setLabel } = detectable;

		const optionElements: Node[] = [];
		for (const option of formatOptions) {
			const { formatValue, html } = option;
			const optionElement = UI.CreateOption(option, detectedValue === html, setLabel);
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

	const Register = (name: string) => {
		if (!Object.keys(Formats).includes(name)) return;

		const formatOption = Formats[name];
		const config = self.Config[name] as string[] | Record<string, string>;
		const options: Record<string, string> = setOptions(config, formatOption.defaultOptions);
		const detectableStyleMap = convertOptionsKeyValue(options);
		const systemStyle = getSystemStyle(formatOption.format);

		for (const [label, option] of Object.entries(options)) {
			formatOption.formatOptions.push({
				type: EFormatType.STYLE,
				format: formatOption.format,
				formatValue: option,
				ui: EFormatUI.LI,
				uiType: EFormatUIType.ITEM,
				uiEvent: ENativeEvents.click,
				html: label
			});
		}

		const labelWrapper = UI.CreateLabel();
		const selection = UI.CreateSelection([labelWrapper, Icons.AngleDown]);

		DOM.Insert(self.Frame.Toolbar, selection);

		const setLabel = setLabelText(labelWrapper);
		const getValue = createGetValue(name, systemStyle, detectableStyleMap);

		const detectable: IDetectableOption = {
			name,
			selection,
			detectableStyleMap,
			systemStyle,
			setLabel,
			getValue
		};

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
			createOptionsWrapper(DOM.GetAttr(labelWrapper, ATTRIBUTE_DATA_VALUE) ?? '', formatOption.formatOptions, detectable);
			DOM.On(DOM.Doc.body, ENativeEvents.click, destroyOptionWrapper);
			self.DOM.On(self.DOM.GetRoot(), ENativeEvents.click, destroyOptionWrapper);
		});

		setLabel(getValue(systemStyle));

		const activation = activate(detectable);

		detector.Register({ type: formatOption.type, format: formatOption.format }, activation);
	};

	return {
		Formats: Object.keys(Formats),
		Register
	};
};

export default Font;