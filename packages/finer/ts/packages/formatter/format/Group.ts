import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import { ENativeEvents } from '../../events/EventSetupUtils';
import { IFormatDetector } from '../FormatDetector';
import { DISABLED_ATTRIBUTE, EFormatUI, EFormatUIType, IFormatDetectorActivator, IFormatOption, IFormatRegistryJoiner } from '../FormatType';
import { IFormatUI } from '../FormatUI';
import { FORMAT_BASES, ConvertToPixel } from '../FormatUtils';

type TCallbackGroupOption = Pick<IFormatGroup, 'DefaultValue' | 'bToggle'>;

interface IFormatGroupItem extends IFormatOption {
	OppositeItem?: string,
	ToggleList?: string[],
	bSubtract?: boolean,
}

interface IFormatGroup {
	ConfigName?: string,
	DefaultValue?: string,
	bToggle?: boolean,
	Items: IFormatGroupItem[],
}

const Group = (editor: Editor, formatDetector: IFormatDetector, formatUI: IFormatUI): IFormatRegistryJoiner => {
	const self = editor;
	const detector = formatDetector;
	const UI = formatUI;
	const CaretUtils = self.Utils.Caret;

	const Formats: Record<string, IFormatGroup> = {
		indentation: {
			ConfigName: 'indentation_size',
			DefaultValue: '16px',
			Items: [
				{ ...FORMAT_BASES.outdent, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('Outdent'), bSubtract: true },
				{ ...FORMAT_BASES.indent, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('Indent'), OppositeItem: FORMAT_BASES.outdent.Title },
			]
		},
		alignment: {
			bToggle: true,
			Items: [
				{
					...FORMAT_BASES.justify, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('AlignJustify'),
					ToggleList: [FORMAT_BASES.alignleft.Title, FORMAT_BASES.aligncenter.Title, FORMAT_BASES.alignright.Title]
				},
				{
					...FORMAT_BASES.alignleft, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('AlignLeft'),
					ToggleList: [FORMAT_BASES.justify.Title, FORMAT_BASES.aligncenter.Title, FORMAT_BASES.alignright.Title]
				},
				{
					...FORMAT_BASES.aligncenter, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('AlignCenter'),
					ToggleList: [FORMAT_BASES.justify.Title, FORMAT_BASES.alignleft.Title, FORMAT_BASES.alignright.Title]
				},
				{
					...FORMAT_BASES.alignright, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('AlignRight'),
					ToggleList: [FORMAT_BASES.justify.Title, FORMAT_BASES.alignleft.Title, FORMAT_BASES.aligncenter.Title]
				},
			]
		}
	};

	const toggleDisable = (ui: HTMLElement, bDisable: boolean) => {
		if (bDisable) {
			DOM.SetAttr(ui, DISABLED_ATTRIBUTE, DISABLED_ATTRIBUTE);
			return;
		}

		DOM.RemoveAttr(ui, DISABLED_ATTRIBUTE);
	};

	const inactivateList = (groupUI: HTMLElement, list: string[] | undefined) => {
		if (!Type.IsArray(list)) return;

		for (const inactivateItem of list) {
			UI.ToggleDefaultButton(DOM.Select(`[title="${inactivateItem}"]`, groupUI) as HTMLElement, false);
		}
	};

	const findTopElement = (node: Node | null): HTMLElement | null => {
		if (!node) return null;
		let topNode = node && DOM.Utils.IsText(node) ? node.parentElement : node as HTMLElement;
		while (topNode) {
			if (topNode.parentElement === self.GetBody()) break;
			topNode = topNode.parentElement;
		}
		return topNode;
	};

	const createDetectCallback = (ui: HTMLElement, groupOption: TCallbackGroupOption, formatOption: IFormatGroupItem): IFormatDetectorActivator => {
		const { bToggle } = groupOption;
		const { Format } = formatOption;

		if (bToggle) return (detectedNode: Node | null) => UI.ToggleDefaultButton(ui, !!detectedNode);

		return (detectedNode: Node | null) => {
			const topNode = findTopElement(detectedNode);
			const formatValue = self.DOM.GetStyle(topNode, Format, true);
			const bActivatable = !topNode || Str.IsEmpty(formatValue) || parseFloat(formatValue) === 0;
			toggleDisable(ui, bActivatable);
		};
	};

	const toggleFormat = (node: HTMLElement, formatOption: IFormatGroupItem, bToggle: boolean) => {
		const { Format, FormatValue } = formatOption;
		if (!FormatValue) return;

		if (bToggle) self.DOM.SetStyle(node, Format, FormatValue);
		else self.DOM.RemoveStyle(node, Format);
	};

	const createClickEvent = (groupUI: HTMLElement, ui: HTMLElement, groupOption: TCallbackGroupOption, formatOption: IFormatGroupItem): (() => void) => {
		const { DefaultValue, bToggle } = groupOption;
		const { Format, bSubtract, OppositeItem, ToggleList } = formatOption;

		const toggle = (node: HTMLElement, bActivated: boolean) => {
			if (bActivated) inactivateList(groupUI, ToggleList);
			toggleFormat(node, formatOption, bActivated);
		};

		const disable = (node: HTMLElement) => {
			if (!DefaultValue) return;
			const formatValue = self.DOM.GetStyle(node, Format, true);
			let convertedValue: string | number = bSubtract ? parseFloat(formatValue) - parseFloat(DefaultValue) : parseFloat(formatValue) + parseFloat(DefaultValue);
			const bDisable = convertedValue <= 0;
			if (!bDisable) convertedValue = Str.Merge(convertedValue.toString(), 'px');
			if (bDisable && bSubtract) toggleDisable(ui, true);

			const toggleStyle = bDisable ? self.DOM.RemoveStyle : self.DOM.SetStyle;
			toggleStyle(node, Format, convertedValue.toString());
			toggleDisable(DOM.Select(`[title="${OppositeItem}"]`, groupUI) as HTMLElement, bDisable);
		};

		return UI.CreateDefaultUIClickEvent(ui, (bActivated: boolean) => {
			const carets = CaretUtils.Get();

			const process = bToggle ? toggle : disable;

			for (const caret of carets) {
				const topNode = findTopElement(caret.SameRoot);
				if (!topNode) continue;

				process(topNode, bActivated);
			}
		}, !!bToggle);
	};

	const createGroup = (groupOption: IFormatGroup): HTMLElement => {
		const { Items, bToggle } = groupOption;

		const groupUI = DOM.Create(EFormatUI.DIV, {
			class: DOM.Utils.CreateUEID('icon-group', false)
		});

		for (const item of Items) {
			const { bSubtract } = item;
			const ui = UI.Create(item);
			DOM.On(ui, ENativeEvents.click, createClickEvent(groupUI, ui, groupOption, item));

			if (bSubtract) toggleDisable(ui, true);
			if (bSubtract || bToggle) detector.Register(item, createDetectCallback(ui, groupOption, item));

			DOM.Insert(groupUI, ui);
		}

		return groupUI;
	};

	const Register = (name: string): HTMLElement | null => {
		if (!Arr.Contains(Object.keys(Formats), name)) return null;
		const formatOption = Formats[name];
		if (formatOption.ConfigName) {
			const config = self.Config[formatOption.ConfigName] as string;
			if (config) formatOption.DefaultValue = ConvertToPixel(config);
		}

		return createGroup(formatOption);
	};

	return {
		Formats: Object.keys(Formats),
		Register
	};
};

export default Group;