import { Arr, Obj, Str, Type } from '@dynafer/utils';
import DOM from '../../dom/DOM';
import Editor from '../../Editor';
import { AllDisableList, Formats } from '../Format';
import ToggleBlock from '../format/ToggleBlock';
import { IFormatDetector } from '../FormatDetector';
import { IBlockFormat, IFormatUIRegistryUnit } from '../FormatType';
import FormatUI, { IFormatUISelection } from '../FormatUI';
import FormatUtils from '../FormatUtils';

interface IBlockFormatItem {
	readonly Format: IBlockFormat,
	readonly Title: string,
	readonly CommandName: string,
	readonly Keys?: string,
}

interface IBlockFormatUI {
	readonly bPreview: boolean,
	readonly Items: IBlockFormatItem[],
	readonly DisableList: Set<string>,
}

const Block = (editor: Editor, detector: IFormatDetector): IFormatUIRegistryUnit => {
	const self = editor;
	const Detector = detector;

	const BlockFormats: Record<string, IBlockFormatUI> = {
		HeadingStyle: {
			bPreview: true,
			Items: [
				{ Format: Formats.Paragraph as IBlockFormat, Title: self.Lang('format.normal', 'Normal'), CommandName: 'Normal' },
				{ Format: Formats.Heading1 as IBlockFormat, Title: self.Lang('format.heading1', 'Heading1'), CommandName: 'Heading1', Keys: 'Alt+Shift+1' },
				{ Format: Formats.Heading2 as IBlockFormat, Title: self.Lang('format.heading2', 'Heading2'), CommandName: 'Heading2', Keys: 'Alt+Shift+2' },
				{ Format: Formats.Heading3 as IBlockFormat, Title: self.Lang('format.heading3', 'Heading3'), CommandName: 'Heading3', Keys: 'Alt+Shift+3' },
				{ Format: Formats.Heading4 as IBlockFormat, Title: self.Lang('format.heading4', 'Heading4'), CommandName: 'Heading4', Keys: 'Alt+Shift+4' },
				{ Format: Formats.Heading5 as IBlockFormat, Title: self.Lang('format.heading5', 'Heading5'), CommandName: 'Heading5', Keys: 'Alt+Shift+5' },
				{ Format: Formats.Heading6 as IBlockFormat, Title: self.Lang('format.heading6', 'Heading6'), CommandName: 'Heading6', Keys: 'Alt+Shift+6' },
			],
			DisableList: AllDisableList
		},
		BlockStyle: {
			bPreview: false,
			Items: [
				{ Format: Formats.Paragraph as IBlockFormat, Title: self.Lang('format.paragraph', 'Paragraph'), CommandName: 'Paragraph' },
				{ Format: Formats.Div as IBlockFormat, Title: self.Lang('format.div', 'Div'), CommandName: 'Div' },
				{ Format: Formats.Blockquote as IBlockFormat, Title: self.Lang('format.blockquote', 'Blockquote'), CommandName: 'Blockquote' },
				{ Format: Formats.Pre as IBlockFormat, Title: self.Lang('format.pre', 'Pre'), CommandName: 'Pre' },
			],
			DisableList: AllDisableList
		},
	};

	const UINames = Obj.Keys(BlockFormats);

	const createCommandName = (uiName: string, title: string): string => Str.Merge(uiName, ':', title);

	const isDetected = (tagName: string, nodes: Node[]): boolean => {
		for (let index = 0, length = nodes.length; index < length; ++index) {
			const node = nodes[index];
			if (!DOM.Closest(node, tagName)) continue;

			return true;
		}
		return false;
	};

	const isDetectedByCaret = (tagName: string, nodes?: Node[]): boolean => {
		const caretNodes: Node[] = Type.IsArray(nodes) ? nodes : [];

		const caret = self.Utils.Caret.Get();
		if (caret) Arr.Push(caretNodes, FormatUtils.GetParentIfText(caret.Start.Node), FormatUtils.GetParentIfText(caret.End.Node));

		return isDetected(tagName, caretNodes);
	};

	const createCommand = (format: IBlockFormat, title: string, setLabelText: (value: string) => void) =>
		(bActive: boolean) => {
			const toggler = ToggleBlock(self, format);
			toggler.ToggleFromCaret(bActive);
			setLabelText(bActive ? title : '');

			self.Utils.Shared.DispatchCaretChange();
		};

	const createOptionsList = (selection: IFormatUISelection, uiName: string, uiFormat: IBlockFormatUI): HTMLElement => {
		const optionElements: HTMLElement[] = [];
		const caretNodes: Node[] = [];

		const caret = self.Utils.Caret.Get();
		if (caret) Arr.Push(caretNodes, FormatUtils.GetParentIfText(caret.Start.Node), FormatUtils.GetParentIfText(caret.End.Node));

		Arr.Each(uiFormat.Items, format => {
			const { Format, Title, CommandName } = format;
			const html = uiFormat.bPreview ? DOM.Utils.WrapTagHTML(Format.Tag, Title) : Title;
			const bSelected = isDetected(Format.Tag, caretNodes);
			const optionElement = FormatUI.CreateOption(html, Title, bSelected);

			FormatUI.BindClickEvent(optionElement, () => {
				FormatUI.DestoryOpenedOptionList(self);
				FormatUI.RunCommand(self, createCommandName(uiName, CommandName), !bSelected);
			});

			Arr.Push(optionElements, optionElement);
		});

		const optionList = FormatUI.CreateOptionList(uiName, optionElements);
		DOM.Insert(self.Frame.Root, optionList);
		FormatUI.SetOptionListCoordinate(self, uiName, selection.Selection, optionList);
		return optionList;
	};

	const Create = (name: string): HTMLElement => {
		const uiName = FormatUtils.GetFormatName(name, UINames);
		const uiFormat = BlockFormats[uiName];

		const selection = FormatUI.CreateSelection(Str.CapitalToSpace(uiName));
		const setLabelText = (value?: string) =>
			DOM.SetText(selection.Label, !value || Str.IsEmpty(value) ? uiFormat.Items[0].Title : value);
		setLabelText();

		Arr.Each(uiFormat.Items, format => {
			const { Format, Title, CommandName, Keys } = format;
			const command = createCommand(Format, Title, setLabelText);
			const commandName = createCommandName(uiName, CommandName);
			FormatUI.RegisterCommand(self, commandName, command);

			if (!Type.IsString(Keys)) return;

			self.AddShortcut(Title, Keys);

			FormatUI.RegisterKeyboardEvent(self, Keys, () => {
				if (FormatUI.IsDisabled(selection.Selection)) return;
				FormatUI.RunCommand(self, commandName, isDetectedByCaret(Format.Tag));
			});
		});

		FormatUI.BindOptionListEvent(self, {
			type: uiName,
			activable: selection.Selection,
			clickable: selection.Selection,
			create: () => createOptionsList(selection, uiName, uiFormat)
		});

		Detector.Register((paths: Node[]) => {
			const node = FormatUtils.GetParentIfText(paths[0]);
			const bNearDisableList = FormatUI.IsNearDisableList(uiFormat.DisableList, selection.Selection, node);
			if (bNearDisableList) return;

			for (let index = 0, length = uiFormat.Items.length; index < length; ++index) {
				const { Format, Title } = uiFormat.Items[index];

				if (!isDetected(Format.Tag, paths)) continue;

				return setLabelText(Title);
			}
			setLabelText();
		});

		return selection.Selection;
	};

	return {
		UINames,
		Create,
	};
};

export default Block;