import { Str, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import { Formats } from '../Format';
import { IFormatDetector } from '../FormatDetector';
import { IFormatUIRegistryUnit, IStyleFormat, TFormatDetectCallback } from '../FormatType';
import FormatUI from '../FormatUI';
import FormatUtils from '../FormatUtils';
import ToggleStyleFormat from '../format/ToggleStyleFormat';

interface IStyleFormatUIItem {
	Format: IStyleFormat | IStyleFormat[],
	Title: string,
	Icon: string,
	bDetector: boolean,
	bSubtract?: boolean,
}

interface IStyleFormatUI {
	ConfigName?: string,
	DefaultValue?: string,
	bCalculate?: boolean,
	Items: IStyleFormatUIItem[],
}

const StyleFormat = (editor: Editor, detector: IFormatDetector): IFormatUIRegistryUnit => {
	const self = editor;
	const Detector = detector;

	const INDENTATION_REGEXP = /[\d]+(px|pt|rem|em)/gi;

	const StyleFormats: Record<string, IStyleFormatUI> = {
		Alignment: {
			Items: [
				{ Format: Formats.Justify as IStyleFormat, Title: 'Justify', Icon: 'AlignJustify', bDetector: true },
				{ Format: Formats.AlignLeft as IStyleFormat[], Title: 'Align left', Icon: 'AlignLeft', bDetector: true },
				{ Format: Formats.AlignCenter as IStyleFormat[], Title: 'Align center', Icon: 'AlignCenter', bDetector: true },
				{ Format: Formats.AlignRight as IStyleFormat[], Title: 'Align right', Icon: 'AlignRight', bDetector: true },
			]
		},
		Indentation: {
			ConfigName: 'IndentationSize',
			DefaultValue: FormatUtils.GetPixcelFromRoot(),
			bCalculate: true,
			Items: [
				{ Format: Formats.Outdent as IStyleFormat, Title: 'Outdent', Icon: 'Outdent', bDetector: true, bSubtract: true },
				{ Format: Formats.Indent as IStyleFormat, Title: 'Indent', Icon: 'Indent', bDetector: false },
			]
		}
	};

	const UINames = Object.keys(StyleFormats);

	const createAlignmentDetector = (formats: IStyleFormat | IStyleFormat[], button: HTMLElement): TFormatDetectCallback => {
		const detect = (format: IStyleFormat, node: Node): boolean => {
			const { StrictFormats, Styles } = format;
			const closest = self.DOM.ClosestByStyle(node as HTMLElement, FormatUtils.GetStyleSelector(Styles));
			const bDetected = !!closest && StrictFormats.has(DOM.Utils.GetNodeName(closest));
			return bDetected;
		};

		return (paths: Node[]) => {
			const node = FormatUtils.GetParentIfText(paths[0]);
			if (!Type.IsArray(formats)) {
				FormatUI.ToggleActivateClass(button, detect(formats, node));
				return;
			}

			for (const format of formats) {
				const bActivate = detect(format, node);
				if (!bActivate) continue;

				FormatUI.ToggleActivateClass(button, bActivate);
				return;
			}

			FormatUI.ToggleActivateClass(button, false);
		};
	};

	const createIndentationDetector = (format: IStyleFormat, button: HTMLElement): TFormatDetectCallback => {
		const { StrictFormats, Styles } = format;
		const styleName = Object.keys(Styles)[0];

		return (paths: Node[]) => {
			const node = FormatUtils.GetParentIfText(paths[0]);
			let blockNode: Node | null = node;
			while (blockNode && blockNode.parentNode !== self.GetBody()) {
				blockNode = blockNode.parentNode;
			}

			if (!blockNode || !StrictFormats.has(DOM.Utils.GetNodeName(blockNode))) return;

			const detectedValue = self.DOM.GetStyle(blockNode as HTMLElement, styleName);
			FormatUI.ToggleDisable(button, Str.IsEmpty(detectedValue) || parseFloat(detectedValue) === 0);
		};
	};

	const createGroup = (uiFormat: IStyleFormatUI, bIndentation: boolean): HTMLElement => {
		const { Items, DefaultValue, bCalculate } = uiFormat;

		const group = FormatUI.CreateIconGroup();
		const createdDetector = bIndentation ? createIndentationDetector : createAlignmentDetector;

		for (const item of Items) {
			const { Format, Title, Icon, bDetector, bSubtract } = item;
			const button = FormatUI.CreateIconButton(Title, Icon);
			const detection = createdDetector(item.Format as IStyleFormat, button);

			if (bSubtract) FormatUI.ToggleDisable(button, true);

			FormatUI.BindClickEvent(button, () => {
				const bActivated = !FormatUI.HasActiveClass(button);
				if (!bCalculate) FormatUI.ToggleActivateClass(button, bActivated);

				const toggler = ToggleStyleFormat(self, Format);
				if (!bCalculate) toggler.ToggleFromCaret(bActivated, DefaultValue);
				else toggler.CalculateFromCaret(DefaultValue ?? FormatUtils.GetPixcelFromRoot(), bSubtract);

				self.Dispatch('caret:change', []);
			});

			DOM.Insert(group, button);

			if (!bDetector) continue;

			Detector.Register(detection);
		}

		return group;
	};

	const getDefaultValue = (original: string, value: unknown) => {
		const defaultValue = Type.IsString(value) ? value : original;
		if (!defaultValue.match(INDENTATION_REGEXP)) return original;

		if (Str.Contains(defaultValue, 'px')) return defaultValue;

		const float = parseFloat(defaultValue);
		if (Str.Contains(defaultValue, 'pt')) return FormatUtils.GetPixelString(FormatUtils.ConvertPointsToPixel(float));

		return FormatUtils.GetPixelString(FormatUtils.MultiplyPixelSize(float));
	};

	const Create = (name: string): HTMLElement => {
		const uiName = FormatUtils.GetFormatName(name, UINames);
		const uiFormat = StyleFormats[uiName];
		if (uiFormat.ConfigName && uiFormat.DefaultValue) {
			const config = FormatUtils.GetFormatConfig(self, uiFormat.DefaultValue, uiFormat.ConfigName);
			uiFormat.DefaultValue = getDefaultValue(uiFormat.DefaultValue, config);
		}

		const group = createGroup(uiFormat, uiName === 'Indentation');

		return group;
	};

	return {
		UINames,
		Create,
	};
};

export default StyleFormat;