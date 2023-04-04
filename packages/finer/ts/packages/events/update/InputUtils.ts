import { Arr, Str } from '@dynafer/utils';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { AllBlockFormats, BlockFormatTags, FigureElementFormats, ListItemSelector } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';

const InputUtils = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const EditFigures = (fragment: DocumentFragment) => {
		const figures = DOM.SelectAll<HTMLElement>({
			tagName: DOM.Element.Figure.Selector
		}, fragment);

		Arr.WhileShift(figures, figure => {
			const figureType = DOM.GetAttr(figure, 'type');
			if (!figureType || !DOM.Element.Figure.HasType(figureType)) figure.remove();
		});

		const figureElements = DOM.SelectAll<HTMLElement>({
			tagName: Arr.Convert(FigureElementFormats)
		}, fragment);

		Arr.WhileShift(figureElements, element => {
			if (!!DOM.Element.Figure.GetClosest(element)) return;

			const figure = DOM.Element.Figure.Create(DOM.Utils.GetNodeName(element));
			DOM.CloneAndInsert(figure, true, element);

			element.parentNode?.replaceChild(figure, element);
		});
	};

	const insertBlocks = (caret: ICaretData, fragment: DocumentFragment) => {
		const nodes = DOM.GetChildNodes(fragment);

		const { EndBlock } = self.Utils.Shared.SplitLines(caret.Start.Node, caret.Start.Offset);

		const startParent = FormatUtils.GetParentIfText(caret.Start.Node);
		const listSelectors = Str.Join(',', ...BlockFormatTags.List);

		let bFirst = true;
		let previousBlock: Node = startParent;
		Arr.WhileShift(nodes, node => {
			const blockName = DOM.Utils.GetNodeName(node);

			if (bFirst) {
				bFirst = false;
				if (BlockFormatTags.Block.has(blockName)) {
					const startBlock = DOM.Closest(startParent, Str.Join(',', ...BlockFormatTags.Block))
						?? DOM.Closest(startParent, ListItemSelector);
					if (startBlock) {
						previousBlock = startBlock;
						return DOM.Insert(startBlock, ...DOM.GetChildNodes(node));
					}
				}
			}

			if (BlockFormatTags.List.has(blockName)) {
				const previousList = DOM.Closest(previousBlock, listSelectors);
				if (previousList && blockName === DOM.Utils.GetNodeName(previousList)) {
					previousBlock = previousList;
					return DOM.Insert(previousList, ...DOM.GetChildNodes(node));
				}
			}

			DOM.InsertAfter(previousBlock, node);
			previousBlock = node;
		});

		const previousName = DOM.Utils.GetNodeName(previousBlock);

		const endBlock = EndBlock ?? previousBlock.nextSibling;
		const endBlockName = DOM.Utils.GetNodeName(endBlock);

		if (previousName === endBlockName && BlockFormatTags.List.has(previousName) && BlockFormatTags.List.has(endBlockName)) {
			Arr.WhileShift(DOM.GetChildNodes(endBlock), listItem => {
				if (DOM.Utils.IsTextEmpty(listItem) || Str.IsEmpty(DOM.GetText(listItem))) return DOM.Remove(listItem);
				DOM.Insert(previousBlock, listItem);
			});
			return DOM.Remove(endBlock);
		}

		const insert = !endBlock ? DOM.Insert : DOM.InsertAfter;
		insert(endBlock ?? self.GetBody(), endBlock);
	};

	const InsertFragment = (caret: ICaretData, fragment: DocumentFragment) => {
		const blockElements = DOM.SelectAll({
			tagName: Arr.Convert(AllBlockFormats)
		}, fragment);

		if (Arr.IsEmpty(blockElements)) return caret.Range.Insert(fragment);

		Arr.Clean(blockElements);
		insertBlocks(caret, fragment);
	};

	const GetProcessedFragment = (caret: ICaretData, bExtract: boolean): DocumentFragment => {
		const extractOrClone = (): DocumentFragment => {
			if (!bExtract) return caret.Range.CloneContents();
			const fragment = caret.Range.Extract();
			FormatUtils.CleanDirtyWithCaret(self, caret);
			return fragment;
		};

		let fragment: DocumentFragment;
		if (caret.Start.Node !== caret.End.Node) {
			const closestAnchor = DOM.Closest(FormatUtils.GetParentIfText(caret.SameRoot), 'a');
			if (caret.SameRoot === self.GetBody() || !closestAnchor) return extractOrClone();
			fragment = extractOrClone();
			const clonedAnchor = DOM.Clone(closestAnchor);
			DOM.Insert(clonedAnchor, ...DOM.GetChildNodes(fragment));
			DOM.Insert(fragment, clonedAnchor);
			return fragment;
		}

		const until = DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node), Str.Join(',', ...BlockFormatTags.Block))
			?? DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node), ListItemSelector);
		const startNode = caret.Start.Node.parentNode;

		if (!until || !startNode) return extractOrClone();

		fragment = DOM.CreateFragment();

		let current: Node | null = startNode.parentNode;
		let nodeStack: Node | null = DOM.Clone(startNode);
		DOM.Insert(nodeStack, extractOrClone());

		while (current && current !== until) {
			const stack = DOM.Clone(current);
			DOM.Insert(stack, nodeStack);
			nodeStack = stack;
			current = current.parentNode;
		}

		DOM.Insert(fragment, nodeStack);
		return fragment;
	};

	return {
		EditFigures,
		InsertFragment,
		GetProcessedFragment,
	};
};

export default InputUtils;