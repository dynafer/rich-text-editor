import { Arr, Str } from '@dynafer/utils';
import Editor from '../../Editor';
import DOM from '../../dom/DOM';
import ToggleBlock from '../format/ToggleBlock';
import { Formats } from '../Format';
import { IFormatDetector } from '../FormatDetector';
import { IBlockFormat, IFormatUIRegistryUnit } from '../FormatType';
import FormatUI, { IFormatUISelection } from '../FormatUI';
import FormatUtils from '../FormatUtils';

interface IBlockFormatItem {
	Format: IBlockFormat,
	Title: string,
}

interface IBlockFormatUI {
	bPreview: boolean,
	Items: IBlockFormatItem[],
}

const Block = (editor: Editor, detector: IFormatDetector): IFormatUIRegistryUnit => {
	const self = editor;
	const Detector = detector;

	const BlockFormats: Record<string, IBlockFormatUI> = {
		HeadingStyle: {
			bPreview: true,
			Items: [
				{ Format: Formats.Paragraph as IBlockFormat, Title: 'Normal' },
				{ Format: Formats.Heading1 as IBlockFormat, Title: 'Heading1' },
				{ Format: Formats.Heading2 as IBlockFormat, Title: 'Heading2' },
				{ Format: Formats.Heading3 as IBlockFormat, Title: 'Heading3' },
				{ Format: Formats.Heading4 as IBlockFormat, Title: 'Heading4' },
				{ Format: Formats.Heading5 as IBlockFormat, Title: 'Heading5' },
				{ Format: Formats.Heading6 as IBlockFormat, Title: 'Heading6' },
			]
		},
		BlockStyle: {
			bPreview: false,
			Items: [
				{ Format: Formats.Paragraph as IBlockFormat, Title: 'Paragraph' },
				{ Format: Formats.Div as IBlockFormat, Title: 'Div' },
				{ Format: Formats.Blockquote as IBlockFormat, Title: 'Blockquote' },
				{ Format: Formats.Pre as IBlockFormat, Title: 'Pre' },
			]
		},
	};

	const UINames = Object.keys(BlockFormats);

	const isDetected = (tagName: string, nodes: Node[]): boolean => {
		for (const node of nodes) {
			if (!self.DOM.Closest(node as Element, tagName)) continue;

			return true;
		}
		return false;
	};

	const createOptionsList = (selection: IFormatUISelection, uiName: string, uiFormat: IBlockFormatUI, setLabelText: (value: string) => void) => {
		const optionElements: HTMLElement[] = [];
		const caretNodes: Node[] = [];
		for (const caret of self.Utils.Caret.Get()) {
			Arr.Push(caretNodes, FormatUtils.GetParentIfText(caret.Start.Node), FormatUtils.GetParentIfText(caret.End.Node));
		}

		for (const format of uiFormat.Items) {
			const { Format, Title } = format;
			const html = uiFormat.bPreview ? DOM.Utils.WrapTagHTML(Format.Tag, Title) : Title;
			const bSelected = isDetected(Format.Tag, caretNodes);
			const optionElement = FormatUI.CreateOption(html, Title, bSelected);
			FormatUI.BindClickEvent(optionElement, () => {
				const toggler = ToggleBlock(self, Format);
				toggler.ToggleFromCaret(!bSelected);
				setLabelText(!bSelected ? Title : '');
			});

			optionElements.push(optionElement);
		}

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
		FormatUI.BindOptionListEvent(self, uiName, selection.Selection, () => createOptionsList(selection, uiName, uiFormat, setLabelText));

		Detector.Register((paths: Node[]) => {
			const node = FormatUtils.GetParentIfText(paths[0]);
			for (const { Format, Title } of uiFormat.Items) {
				if (!isDetected(Format.Tag, [node])) continue;

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