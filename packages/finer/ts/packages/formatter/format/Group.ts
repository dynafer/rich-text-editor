import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import { ENativeEvents } from '../../events/EventSetupUtils';
import { IFormatDetector } from '../FormatDetector';
import { EFormatUI, EFormatUIType, IFormatDetectorActivator, IFormatOption, IFormatRegistryJoiner, IFormatToggleTopNodeSettingBase } from '../FormatType';
import { IFormatUI } from '../FormatUI';
import { FORMAT_BASES, ConvertToPixel, FindTopNode } from '../FormatUtils';

type TCallbackGroupOption = Pick<IFormatGroup, 'DefaultValue' | 'bCalculate'>;

interface IFormatGroupItem extends IFormatOption, Pick<IFormatToggleTopNodeSettingBase, 'bSubtract'> {
	OppositeItem?: string,
	ToggleList?: string[],
}

interface IFormatGroup extends Pick<IFormatToggleTopNodeSettingBase, 'DefaultValue' | 'bCalculate'> {
	ConfigName?: string,
	Items: IFormatGroupItem[],
}

const Group = (editor: Editor, formatDetector: IFormatDetector, formatUI: IFormatUI): IFormatRegistryJoiner => {
	const self = editor;
	const detector = formatDetector;
	const UI = formatUI;

	const Formats: Record<string, IFormatGroup> = {
		indentation: {
			ConfigName: 'indentation_size',
			DefaultValue: '16px',
			bCalculate: true,
			Items: [
				{ ...FORMAT_BASES.outdent, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('Outdent'), bSubtract: true },
				{ ...FORMAT_BASES.indent, UIName: EFormatUI.BUTTON, UIType: EFormatUIType.ICON, Html: Finer.Icons.Get('Indent'), OppositeItem: FORMAT_BASES.outdent.Title },
			]
		},
		alignment: {
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

	const inactivateList = (groupUI: HTMLElement, list: string[] | undefined) => {
		if (!Type.IsArray(list)) return;

		for (const inactivateItem of list) {
			UI.ToggleDefaultButton(DOM.Select(`[title="${inactivateItem}"]`, groupUI) as HTMLElement, false);
		}
	};

	const createDetectCallback = (ui: HTMLElement, groupOption: TCallbackGroupOption, formatOption: IFormatGroupItem): IFormatDetectorActivator => {
		const { bCalculate } = groupOption;
		const { Format } = formatOption;

		if (!bCalculate) return (detectedNode: Node | null) => UI.ToggleDefaultButton(ui, !!detectedNode);

		return (detectedNode: Node | null) => {
			const topNode = FindTopNode(self, detectedNode);
			const formatValue = self.DOM.GetStyle(topNode as HTMLElement, Format, true);
			const bActivatable = !topNode || Str.IsEmpty(formatValue) || parseFloat(formatValue) === 0;
			UI.ToggleDefaultDisable(ui, bActivatable);
		};
	};

	const createGroup = (groupOption: IFormatGroup): HTMLElement => {
		const { Items, DefaultValue, bCalculate } = groupOption;

		const groupUI = DOM.Create(EFormatUI.DIV, {
			class: DOM.Utils.CreateUEID('icon-group', false)
		});

		for (const item of Items) {
			const { OppositeItem, ToggleList, bSubtract } = item;
			const ui = UI.Create(item);
			if (bSubtract) UI.ToggleDefaultDisable(ui, true);

			DOM.On(ui, ENativeEvents.click, UI.CreateDefaultUIClickEvent(ui, (bActivated: boolean) => {
				if (!bCalculate && bActivated) inactivateList(groupUI, ToggleList);

				const bZero = UI.ToggleTopNodeWithBoolean(ui, bActivated, item, { DefaultValue, bCalculate, bSubtract });
				if (!DefaultValue) return;

				UI.ToggleDefaultDisable(DOM.Select(`[title="${OppositeItem}"]`, groupUI) as HTMLElement, bZero);
			}, !bCalculate));

			if (bSubtract || !bCalculate) detector.Register(item, createDetectCallback(ui, groupOption, item));

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