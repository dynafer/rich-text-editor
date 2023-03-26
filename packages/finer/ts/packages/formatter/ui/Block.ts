import { Arr, Str, Type } from '@dynafer/utils';
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
				{ Format: Formats.Paragraph as IBlockFormat, Title: 'Normal' },
				{ Format: Formats.Heading1 as IBlockFormat, Title: 'Heading1', Keys: 'Alt+Shift+1' },
				{ Format: Formats.Heading2 as IBlockFormat, Title: 'Heading2', Keys: 'Alt+Shift+2' },
				{ Format: Formats.Heading3 as IBlockFormat, Title: 'Heading3', Keys: 'Alt+Shift+3' },
				{ Format: Formats.Heading4 as IBlockFormat, Title: 'Heading4', Keys: 'Alt+Shift+4' },
				{ Format: Formats.Heading5 as IBlockFormat, Title: 'Heading5', Keys: 'Alt+Shift+5' },
				{ Format: Formats.Heading6 as IBlockFormat, Title: 'Heading6', Keys: 'Alt+Shift+6' },
			],
			DisableList: AllDisableList
		},
		BlockStyle: {
			bPreview: false,
			Items: [
				{ Format: Formats.Paragraph as IBlockFormat, Title: 'Paragraph' },
				{ Format: Formats.Div as IBlockFormat, Title: 'Div' },
				{ Format: Formats.Blockquote as IBlockFormat, Title: 'Blockquote' },
				{ Format: Formats.Pre as IBlockFormat, Title: 'Pre' },
			],
			DisableList: AllDisableList
		},
	};

	const UINames = Object.keys(BlockFormats);

	const createCommandName = (uiName: string, title: string): string => Str.Merge(uiName, ':', title);

	const isDetected = (tagName: string, nodes: Node[]): boolean => {
		for (let index = 0, length = nodes.length; index < length; ++index) {
			const node = nodes[index];
			if (!self.DOM.Closest(node, tagName)) continue;

			return true;
		}
		return false;
	};

	const isDetectedByCaret = (tagName: string, nodes?: Node[]): boolean => {
		const caretNodes: Node[] = Type.IsArray(nodes) ? nodes : [];
		if (Arr.IsEmpty(caretNodes)) {
			Arr.Each(self.Utils.Caret.Get(), caret =>
				Arr.Push(caretNodes, FormatUtils.GetParentIfText(caret.Start.Node), FormatUtils.GetParentIfText(caret.End.Node))
			);
		}

		return isDetected(tagName, caretNodes);
	};

	const createCommand = (format: IBlockFormat, title: string, setLabelText: (value: string) => void) =>
		<T = boolean>(bActive: T) => {
			const toggler = ToggleBlock(self, format);
			toggler.ToggleFromCaret(bActive as boolean);
			setLabelText(bActive ? title : '');

			self.Utils.Shared.DispatchCaretChange();
		};

	const createOptionsList = (selection: IFormatUISelection, uiName: string, uiFormat: IBlockFormatUI) => {
		const optionElements: HTMLElement[] = [];
		const caretNodes: Node[] = [];
		Arr.Each(self.Utils.Caret.Get(), caret =>
			Arr.Push(caretNodes, FormatUtils.GetParentIfText(caret.Start.Node), FormatUtils.GetParentIfText(caret.End.Node))
		);
		self.Utils.Caret.Clean();

		Arr.Each(uiFormat.Items, format => {
			const { Format, Title } = format;
			const html = uiFormat.bPreview ? DOM.Utils.WrapTagHTML(Format.Tag, Title) : Title;
			const bSelected = isDetected(Format.Tag, caretNodes);
			const optionElement = FormatUI.CreateOption(html, Title, bSelected);

			FormatUI.BindClickEvent(optionElement, () => FormatUI.RunCommand(self, createCommandName(uiName, Title), !bSelected));

			Arr.Push(optionElements, optionElement);
		});

		const optionList = FormatUI.CreateOptionList(uiName, optionElements);
		DOM.Insert(self.Frame.Root, optionList);
		FormatUI.SetOptionListCoordinate(self, uiName, selection.Selection, optionList);
	};

	const Create = (name: string): HTMLElement => {
		const uiName = FormatUtils.GetFormatName(name, UINames);
		const uiFormat = BlockFormats[uiName];

		const selection = FormatUI.CreateSelection(Str.CapitalToSpace(uiName));
		const setLabelText = (value?: string) => {
			if (!value || Str.IsEmpty(value)) return DOM.SetText(selection.Label, uiFormat.Items[0].Title);
			DOM.SetText(selection.Label, value);
		};
		setLabelText();

		Arr.Each(uiFormat.Items, format => {
			const { Format, Title, Keys } = format;
			const command = createCommand(Format, Title, setLabelText);
			const commandName = createCommandName(uiName, Title);
			FormatUI.RegisterCommand(self, commandName, command);

			if (!Type.IsString(Keys)) return;
			FormatUI.RegisterKeyboardEvent(self, Keys, () => {
				if (FormatUI.IsDisabled(selection.Selection)) return;
				FormatUI.RunCommand(self, commandName, isDetectedByCaret(Format.Tag));
			});
		});

		FormatUI.BindOptionListEvent(self, uiName, selection.Selection, selection.Selection, () => createOptionsList(selection, uiName, uiFormat));

		Detector.Register((paths: Node[]) => {
			const node = FormatUtils.GetParentIfText(paths[0]);
			const bNearDisableList = FormatUI.IsNearDisableList(self, uiFormat.DisableList, selection.Selection, node);
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