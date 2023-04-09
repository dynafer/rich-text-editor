import { Arr, Obj, Str, Type } from '@dynafer/utils';
import DOM from '../../dom/DOM';
import Editor from '../../Editor';
import { Formats } from '../Format';
import ToggleStyleFormat from '../format/ToggleStyleFormat';
import { IFormatDetector } from '../FormatDetector';
import { IFormatUIRegistryUnit, IStyleFormat, TFormatDetectCallback } from '../FormatType';
import FormatUI from '../FormatUI';
import FormatUtils from '../FormatUtils';

interface IStyleFormatUIItem {
	readonly Format: IStyleFormat | IStyleFormat[],
	Title: string,
	Icon: string,
	bDetector: boolean,
	bSubtract?: boolean,
	Keys?: string,
}

interface IStyleFormatUI {
	ConfigName?: Capitalize<string>,
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
				{ Format: Formats.Justify as IStyleFormat, Title: Finer.ILC.Get('format.alignJustify') ?? 'Justify', Icon: 'AlignJustify', bDetector: true },
				{ Format: Formats.AlignLeft as IStyleFormat[], Title: Finer.ILC.Get('format.alignLeft') ?? 'Align left', Icon: 'AlignLeft', bDetector: true },
				{ Format: Formats.AlignCenter as IStyleFormat[], Title: Finer.ILC.Get('format.alignCenter') ?? 'Align center', Icon: 'AlignCenter', bDetector: true },
				{ Format: Formats.AlignRight as IStyleFormat[], Title: Finer.ILC.Get('format.alignRight') ?? 'Align right', Icon: 'AlignRight', bDetector: true },
			]
		},
		Indentation: {
			ConfigName: 'IndentationSize',
			DefaultValue: FormatUtils.GetPixcelFromRoot(),
			bCalculate: true,
			Items: [
				{ Format: Formats.Outdent as IStyleFormat, Title: Finer.ILC.Get('format.Outdent') ?? 'Outdent', Icon: 'Outdent', bDetector: true, bSubtract: true, Keys: 'Shift+Tab' },
				{ Format: Formats.Indent as IStyleFormat, Title: Finer.ILC.Get('format.Indent') ?? 'Indent', Icon: 'Indent', bDetector: false, Keys: 'Tab' },
			]
		}
	};

	const UINames = Obj.Keys(StyleFormats);

	const createAlignmentDetector = (formats: IStyleFormat | IStyleFormat[], button: HTMLElement, bDetector: boolean): TFormatDetectCallback => {
		const detect = (format: IStyleFormat, node: Node): boolean => {
			const { StrictFormats, Styles } = format;
			const closest = DOM.ClosestByStyle(node, FormatUtils.GetStyleSelectorMap(Styles));
			return !!closest && StrictFormats.has(DOM.Utils.GetNodeName(closest));
		};

		return (paths: Node[]) => {
			const node = FormatUtils.GetParentIfText(paths[0]);
			if (!Type.IsArray(formats)) {
				const bNearDisableList = FormatUI.IsNearDisableList(formats.DisableList, button, node);
				if (bNearDisableList || !bDetector) return;

				return FormatUI.ToggleActivateClass(button, detect(formats, node));
			}

			for (let index = 0, length = formats.length; index < length; ++index) {
				const format = formats[index];

				const bNearDisableList = FormatUI.IsNearDisableList(format.DisableList, button, node);
				if (bNearDisableList || !bDetector) return;

				const bActivate = detect(format, node);
				if (!bActivate) continue;

				return FormatUI.ToggleActivateClass(button, bActivate);
			}

			FormatUI.ToggleActivateClass(button, false);
		};
	};

	const createIndentationDetector = (format: IStyleFormat, button: HTMLElement, bDetector: boolean): TFormatDetectCallback => {
		const { StrictFormats, Styles } = format;
		const styleName = Obj.Keys(Styles)[0];

		return (paths: Node[]) => {
			const node = FormatUtils.GetParentIfText(paths[0]);

			const bNearDisableList = FormatUI.IsNearDisableList(format.DisableList, button, node);
			if (bNearDisableList || !bDetector) return;

			let blockNode: Node | null = node;
			while (blockNode && blockNode.parentNode !== self.GetBody()) {
				blockNode = blockNode.parentNode;
			}

			if (!blockNode || !StrictFormats.has(DOM.Utils.GetNodeName(blockNode))) return;

			const detectedValue = DOM.GetStyle(blockNode, styleName);
			FormatUI.ToggleDisable(button, Str.IsEmpty(detectedValue) || parseFloat(detectedValue) === 0);
		};
	};

	const createCommand = (button: HTMLElement, uiFormat: IStyleFormatUI, uiFormatItem: IStyleFormatUIItem) => {
		const { DefaultValue, bCalculate } = uiFormat;
		const { Format, bSubtract } = uiFormatItem;

		return <T = boolean>(bActive: T) => {
			if (!bCalculate) FormatUI.ToggleActivateClass(button, bActive as boolean);

			const toggler = ToggleStyleFormat(self, Format);
			if (!bCalculate) {
				toggler.ToggleFromCaret(bActive as boolean, DefaultValue);
				return self.Utils.Shared.DispatchCaretChange();
			}

			toggler.CalculateFromCaret(DefaultValue ?? FormatUtils.GetPixcelFromRoot(), bSubtract);
			self.Utils.Shared.DispatchCaretChange();
		};
	};

	const createGroup = (uiFormat: IStyleFormatUI, bIndentation: boolean): HTMLElement => {
		const { Items } = uiFormat;

		const group = FormatUI.CreateIconGroup();
		const createdDetector = bIndentation ? createIndentationDetector : createAlignmentDetector;

		Arr.Each(Items, item => {
			const { Title, Icon, bDetector, bSubtract, Keys } = item;
			const button = FormatUI.CreateIconButton(Title, Icon);
			const command = createCommand(button, uiFormat, item);

			FormatUI.RegisterCommand(self, Title, command);

			const eventCallback = () => FormatUI.RunCommand(self, Title, !FormatUI.HasActiveClass(button));

			if (bSubtract) FormatUI.ToggleDisable(button, true);

			if (Type.IsString(Keys)) {
				self.AddShortcut(Title, Keys);

				FormatUI.RegisterKeyboardEvent(self, Keys, (e: Editor, event: Event) => {
					if (FormatUI.IsDisabled(button)) return;
					const figure = DOM.Element.Figure.GetClosest(event.target);
					if (figure) return;
					eventCallback();
				});
			}
			FormatUI.BindClickEvent(button, eventCallback);

			DOM.Insert(group, button);

			Detector.Register(createdDetector(item.Format as IStyleFormat, button, bDetector));
		});

		return group;
	};

	const getDefaultValue = (original: string, value: unknown): string => {
		const defaultValue = Type.IsString(value) ? value : original;
		if (!defaultValue.match(INDENTATION_REGEXP)) return original;

		if (Str.Contains(defaultValue, 'px')) return defaultValue;

		const float = parseFloat(defaultValue);
		const convert = Str.Contains(defaultValue, 'pt') ? FormatUtils.ConvertPointsToPixel : FormatUtils.MultiplyPixelSize;

		return FormatUtils.GetPixelString(convert(float));
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