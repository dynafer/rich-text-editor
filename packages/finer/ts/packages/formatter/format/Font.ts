import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import * as Icons from '../../icons/Icons';
import FormatCaret from '../FormatCaret';
import FormatDetector from '../FormatDetector';
import { EFormatType, EFormatUI, IFormatOptionBase, IFormatOption, IFormatDetectorActivator, ACTIVE_CLASS, STANDARD_POINTS_FROM_PIXEL, STANDARD_PIXEL_FROM_POINTS } from '../FormatType';
import FormatUI from '../FormatUI';

const Formats: Record<string, IFormatSelector> = {
	fontsize: {
		type: EFormatType.STYLE,
		format: 'font-size',
		options: [],
		defaultOptions: ['9pt', '12pt', '18pt', '24pt', '48pt'],
	},
	fontfamily: {
		type: EFormatType.STYLE,
		format: 'font-family',
		options: [],
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

interface IFormatSelector extends Pick<IFormatOptionBase, 'type' | 'format'> {
	options: IFormatOption[],
	defaultOptions: string[] | Record<string, string>,
}

interface IDetectableOption {
	name: string,
	label: HTMLElement,
	optionWrapper: HTMLElement,
	detectableStyleMap: Record<string, string>,
	systemStyle: string,
	setLabel: (text: string) => void,
	activator: IFormatDetectorActivator,
}

const Font = (editor: Editor) => {
	const self = editor;
	const caretToggler = FormatCaret(self);
	const detector = FormatDetector(self);
	const UI = FormatUI(self);

	const escapeUnnecessaryChars = (value: string) => value.replace(/["`';]/g, '');
	const convertToDetecterValue = (value: string) => escapeUnnecessaryChars(value).toLowerCase();
	const getSystemStyle = (style: string) => self.DOM.GetStyle(self.GetBody(), style);
	const convertFontSize = (size: string): string => {
		const bPixel = size.toLowerCase().includes('px');
		const replaced = parseFloat(size.toLowerCase().replace(bPixel ? 'px' : 'pt', '')) ?? 0;
		return `${replaced * (bPixel ? STANDARD_POINTS_FROM_PIXEL : STANDARD_PIXEL_FROM_POINTS)}${bPixel ? 'pt' : 'px'}`;
	};

	const processBeforeActive = (optionWrapper: HTMLElement) => {
		for (const activated of DOM.SelectAll(`.${ACTIVE_CLASS}`, optionWrapper)) {
			DOM.RemoveClass(activated, ACTIVE_CLASS);
		}
	};

	const getPrimaryValue = (value: string) => value.split(',')[0].trim();

	const convertOptionsKeyValue = (options: Record<string, string>): Record<string, string> => {
		const newOptions: Record<string, string> = {};
		for (const [label, option] of Object.entries(options)) {
			newOptions[getPrimaryValue(option)] = label;
		}
		return newOptions;
	};

	const setLabelText = (label: HTMLElement) => (text: string) => DOM.SetText(label, text);

	const activate = (detectable: IDetectableOption): IFormatDetectorActivator => {
		const { optionWrapper, systemStyle, detectableStyleMap, setLabel, activator } = detectable;

		return (bActive: boolean, detected: string) => {
			processBeforeActive(optionWrapper);

			const detectedValue = !bActive || Str.IsEmpty(detected) ? systemStyle : detected;
			const convertedValue = getPrimaryValue(convertToDetecterValue(detectedValue));

			const optionLabel = detectableStyleMap[convertedValue];
			if (bActive && optionLabel) {
				const optionElement = DOM.Select(`[data-value="${optionLabel}"]`);
				DOM.AddClass(optionElement, ACTIVE_CLASS);
				setLabel(optionLabel);
				return;
			}

			activator(bActive, detected);
		};
	};

	const createOptionElements = (name: string, label: HTMLElement, wrapper: HTMLElement, options: IFormatOption[]): HTMLElement[] => {
		const optionElements: HTMLElement[] = [];
		for (const option of options) {
			const { type, format, formatValue } = option;
			const optionElement = UI.Create(option, false, wrapper);
			DOM.SetHTML(optionElement, `${Icons.Check}${DOM.GetHTML(optionElement)}`);
			DOM.SetAttr(optionElement, 'data-value', option.html);
			if (name === 'fontfamily') DOM.SetStyle(optionElement, format, formatValue ?? '');

			DOM.On(optionElement, 'click', () => {
				setLabelText(label)(option.html);
				processBeforeActive(wrapper);
				DOM.AddClass(optionElement, ACTIVE_CLASS);
				self.Focus();
				caretToggler.Toggle(false, { type, format, formatValue });
				caretToggler.Toggle(true, { type, format, formatValue });
			});

			optionElements.push(optionElement);
		}

		return optionElements;
	};

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

	const activatorForFontSize = (systemStyle: string, detectableStyleMap: Record<string, string>, setLabel: (text: string) => void): IFormatDetectorActivator =>
		(bActive: boolean, detected: string) => {
			const detectedValue = !bActive || Str.IsEmpty(detected) ? systemStyle : detected;
			const convertedValue = getPrimaryValue(convertToDetecterValue(detectedValue));

			const convertedSize = convertFontSize(convertedValue);
			const convertedOpotionLabel = detectableStyleMap[convertedSize];
			if (!convertedOpotionLabel) {
				setLabel(escapeUnnecessaryChars(detectedValue));
				return;
			}

			setLabel(convertedOpotionLabel);
		};

	const activatorForFontFamily = (systemStyle: string, setLabel: (text: string) => void): IFormatDetectorActivator =>
		(bActive: boolean, detected: string) => {
			const detectedValue = !bActive || Str.IsEmpty(detected) ? systemStyle : detected;

			setLabel(detectedValue === systemStyle ? 'System Font' : escapeUnnecessaryChars(detectedValue));
		};

	const createActivator = (
		name: string,
		systemStyle: string,
		detectableStyleMap: Record<string, string>,
		setLabel: (text: string) => void
	): IFormatDetectorActivator => {
		switch (name) {
			case 'fontsize':
				return activatorForFontSize(systemStyle, detectableStyleMap, setLabel);
			case 'fontfamily':
			default:
				return activatorForFontFamily(systemStyle, setLabel);
		}
	};

	const Register = (name: string) => {
		if (!Object.keys(Formats).includes(name)) return;

		const formatOption = Formats[name];
		const config = self.Config[name] as string[] | Record<string, string>;
		const options: Record<string, string> = setOptions(config, formatOption.defaultOptions);
		const detectableStyleMap = convertOptionsKeyValue(options);
		const systemStyle = getSystemStyle(formatOption.format);

		for (const [label, option] of Object.entries(options)) {
			formatOption.options.push({
				type: EFormatType.STYLE,
				format: formatOption.format,
				formatValue: option,
				ui: EFormatUI.LI,
				uiType: EFormatUI.LI,
				uiEvent: 'click',
				html: label
			});
		}

		const label = UI.CreateLabel();
		const optionWrapper = UI.CreateOptionWrapper();
		const optionElements = createOptionElements(name, label, optionWrapper, formatOption.options);
		DOM.Insert(optionWrapper, optionElements);
		const selection = UI.CreateSelection([label, optionWrapper]);
		DOM.On(selection, 'click', () => {
			const toggle = DOM.IsHidden(optionWrapper) ? DOM.Show : DOM.Hide;
			toggle(optionWrapper);
		});

		DOM.On(DOM.Doc.body, 'click', (event) => {
			if (DOM.IsHidden(optionWrapper)) return;
			const path = event.composedPath();
			if (path[0] === selection || path[0] === label) return;
			DOM.Hide(optionWrapper);
		});

		DOM.Insert(self.Frame.Toolbar, selection);
		editor.On('click', () => {
			if (DOM.IsHidden(optionWrapper)) return;
			DOM.Hide(optionWrapper);
		});

		const setLabel = setLabelText(label);
		const activator = createActivator(name, systemStyle, detectableStyleMap, setLabel);

		activator(false, systemStyle);

		const detectable: IDetectableOption = {
			name,
			label,
			optionWrapper,
			detectableStyleMap,
			systemStyle,
			setLabel,
			activator
		};

		const activation = activate(detectable);

		detector.Register({ type: formatOption.type, format: formatOption.format }, activation);
	};

	return {
		Formats: Object.keys(Formats),
		Register
	};
};

export default Font;