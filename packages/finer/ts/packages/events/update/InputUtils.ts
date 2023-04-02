import { NodeType } from '@dynafer/dom-control';
import { Arr, Str } from '@dynafer/utils';
import { TElement } from '../../dom/DOM';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { AllBlockFormats, BlockFormatTags, FigureElementFormats, ListItemSelector, ListSelector } from '../../formatter/Format';
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
			if (!figureType || !FigureElementFormats.has(figureType)) figure.remove();
		});

		const figureElements = DOM.SelectAll<HTMLElement>({
			tagName: Arr.Convert(FigureElementFormats)
		}, fragment);

		Arr.WhileShift(figureElements, element => {
			if (!!DOM.Element.Figure.GetClosest(element)) return;

			const figure = DOM.Element.Figure.Create(DOM.Utils.GetNodeName(element));
			DOM.CloneAndInsert(figure, true, element);

			const tools = self.Tools.DOM.Manager.SelectTools(true, figure);
			Arr.Each(tools, tool => DOM.Remove(tool, true));

			element.parentNode?.replaceChild(figure, element);
		});
	};

	const insertBlocks = (caret: ICaretData, fragment: DocumentFragment) => {
		const nodes = DOM.GetChildNodes(fragment);

		const { EndBlock } = self.Utils.Shared.SplitLines(caret.Start.Node, caret.Start.Offset);

		let bStopInlineNodes = false;
		let bInList = false;
		let previousNode: TElement = null;

		const insert = (insertion: Node) => {
			const previous = previousNode;
			previousNode = insertion;

			if (!bInList) return !previous
				? caret.Range.Insert(insertion)
				: DOM.InsertAfter(previous, insertion);

			if (!bStopInlineNodes) return;

			const previousList = DOM.Closest(previous, ListSelector);
			const previousListName = DOM.Utils.GetNodeName(previousList);
			const listName = DOM.Utils.GetNodeName(DOM.Closest(insertion, ListSelector));

			if (previousListName !== listName) {
				bInList = false;
				return DOM.InsertAfter(previousList, insertion);
			}

			previousNode = previous;
			Arr.Each(DOM.GetChildNodes(insertion), child => {
				DOM.InsertAfter(previousNode, child);
				previousNode = child;
			});
		};

		Arr.WhileShift(nodes, node => {
			const nodeName = DOM.Utils.GetNodeName(node);

			if (bStopInlineNodes || !AllBlockFormats.has(nodeName)) return insert(node);

			if (nodeName === ListItemSelector) {
				const listFromCaret = DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node), ListSelector);
				if (!previousNode && !!listFromCaret)
					previousNode = listFromCaret;

				if (previousNode && !!DOM.Closest(previousNode, ListSelector)) {
					bInList = true;
					const previousList = DOM.Closest(previousNode, ListSelector);
					return DOM.Insert(previousList, node);
				}

				const newNode = DOM.Create('p');
				DOM.Insert(newNode, ...DOM.GetChildNodes(node));
				node.parentNode?.replaceChild(newNode, node);
				return insert(newNode);
			}

			if (!BlockFormatTags.Block.has(nodeName) || previousNode) {
				const parentIfText = FormatUtils.GetParentIfText(caret.Start.Node);
				bInList = !!DOM.Closest(parentIfText, ListItemSelector);
				bStopInlineNodes = true;
				previousNode = DOM.Closest(parentIfText, ListItemSelector)
					?? DOM.Closest(parentIfText, Str.Join(',', ...BlockFormatTags.Block))
					?? caret.Start.Path[0];
				return insert(node);
			}

			const children = DOM.GetChildNodes(node);
			if (Arr.IsEmpty(children)) return;

			Arr.Each(children, child => {
				if (!previousNode) caret.Range.Insert(child);
				else DOM.InsertAfter(previousNode, child);

				previousNode = child;
			});
		});

		if (!EndBlock || !previousNode) return;

		if (!bInList || !BlockFormatTags.List.has(DOM.Utils.GetNodeName(EndBlock))) {
			const blockNode = DOM.Closest(previousNode, Str.Join(',', ...BlockFormatTags.Block))
				?? DOM.Closest(previousNode, ListSelector)
				?? DOM.Element.Figure.GetClosest(previousNode)
				?? DOM.GetParents(previousNode)[0];

			return DOM.InsertAfter(blockNode, EndBlock);
		}

		const previousList = DOM.Closest(FormatUtils.GetParentIfText(previousNode), ListSelector);
		const endList = DOM.Closest(FormatUtils.GetParentIfText(EndBlock), ListSelector);

		if (DOM.Utils.GetNodeName(endList) !== DOM.Utils.GetNodeName(previousList))
			return DOM.InsertAfter(previousList, endList);

		const listItems: Node[] = [];
		Arr.Each(DOM.GetChildNodes(endList), child => {
			if (NodeType.IsText(child) || (!DOM.Select('br', child) && Str.IsEmpty(DOM.GetText(child)))) return;

			Arr.Push(listItems, child);
		});

		DOM.InsertAfter(DOM.Utils.GetLastChild(previousList), ...listItems);
	};

	const InsertFragment = (caret: ICaretData, fragment: DocumentFragment) => {
		const blockElements = DOM.SelectAll({
			tagName: Arr.Convert(AllBlockFormats)
		}, fragment);

		if (Arr.IsEmpty(blockElements)) return caret.Range.Insert(fragment);

		Arr.Clean(blockElements);
		insertBlocks(caret, fragment);
	};

	return {
		EditFigures,
		InsertFragment,
	};
};

export default InputUtils;