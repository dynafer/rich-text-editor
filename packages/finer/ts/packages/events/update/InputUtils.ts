import { Arr, Str } from '@dynafer/utils';
import { TElement } from '../../dom/DOM';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { AllBlockFormats, BlockFormatTags, FigureElementFormats, FigureSelector, ListItemSelector, ListSelector } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';

const InputUtils = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const EditFigures = (fragment: DocumentFragment) => {
		const figures = DOM.SelectAll({
			tagName: FigureSelector
		}, fragment);

		let currentFigure: HTMLElement | undefined = undefined;
		while (!Arr.IsEmpty(figures)) {
			currentFigure = Arr.Shift(figures);
			if (!currentFigure) continue;

			const figureType = DOM.GetAttr(currentFigure, 'type');
			if (!figureType || !FigureElementFormats.has(figureType)) currentFigure.remove();
		}
		currentFigure = undefined;

		const figureElements = DOM.SelectAll({
			tagName: Array.from(FigureElementFormats)
		}, fragment);

		let currentElement: HTMLElement | undefined = undefined;
		while (!Arr.IsEmpty(figureElements)) {
			currentElement = Arr.Shift(figureElements);
			if (!currentElement || DOM.Closest(currentElement, FigureSelector)) continue;

			const tagName = DOM.Utils.GetNodeName(currentElement);
			if (!FigureElementFormats.has(tagName)) {
				currentElement.remove();
				continue;
			}

			const figure = DOM.Create(FigureSelector, {
				attrs: {
					type: tagName,
					contenteditable: 'false',
				}
			});

			DOM.CloneAndInsert(figure, true, currentElement);

			const tools = DOM.SelectAll({
				attrs: {
					dataFixed: 'dom-tool'
				}
			}, figure);

			Arr.Each(tools, tableTool => DOM.Remove(tableTool, true));

			currentElement.parentNode?.replaceChild(figure, currentElement);
		}
		currentElement = undefined;
	};

	const insertBlocks = (caret: ICaretData, fragment: DocumentFragment) => {
		const nodes = DOM.GetChildNodes(fragment);

		const endBlock = self.Utils.Shared.SplitLines(caret.Start.Node, caret.Start.Offset).endBlock;

		let bStopInlineNodes = false;
		let bInList = false;
		let node: TElement = null;
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

		while (!Arr.IsEmpty(nodes)) {
			node = Arr.Shift(nodes) ?? null;
			if (!node) continue;

			const nodeName = DOM.Utils.GetNodeName(node);

			if (bStopInlineNodes || !AllBlockFormats.has(nodeName)) {
				insert(node);
				continue;
			}

			if (nodeName === ListItemSelector) {
				const listFromCaret = DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node), ListSelector);
				if (!previousNode && !!listFromCaret)
					previousNode = listFromCaret;

				if (previousNode && !!DOM.Closest(previousNode, ListSelector)) {
					const previousList = DOM.Closest(previousNode, ListSelector);
					DOM.Insert(previousList, node);
					bInList = true;
					continue;
				}

				const newNode = DOM.Create('p');
				DOM.Insert(newNode, ...DOM.GetChildNodes(node));
				node.parentNode?.replaceChild(newNode, node);
				insert(newNode);
				continue;
			}

			if (!BlockFormatTags.Block.has(nodeName) || previousNode) {
				const parentIfText = FormatUtils.GetParentIfText(caret.Start.Node);
				bInList = !!DOM.Closest(parentIfText, ListItemSelector);
				bStopInlineNodes = true;
				previousNode = DOM.Closest(parentIfText, ListItemSelector)
					?? DOM.Closest(parentIfText, Str.Join(',', ...BlockFormatTags.Block))
					?? caret.Start.Path[0];
				insert(node);
				continue;
			}

			const children = DOM.GetChildNodes(node);
			if (Arr.IsEmpty(children)) continue;
			for (let index = 0, length = children.length; index < length; ++index) {
				const child = children[index];
				if (!previousNode) caret.Range.Insert(child);
				else DOM.InsertAfter(previousNode, child);

				previousNode = child;
			}
		}

		if (!endBlock || !previousNode) return;

		if (!bInList || !BlockFormatTags.List.has(DOM.Utils.GetNodeName(endBlock))) {
			const blockNode = DOM.Closest(previousNode, Str.Join(',', ...BlockFormatTags.Block))
				?? DOM.Closest(previousNode, ListSelector)
				?? DOM.Closest(previousNode, FigureSelector)
				?? DOM.GetParents(previousNode)[0];

			return DOM.InsertAfter(blockNode, endBlock);
		}

		const previousList = DOM.Closest(FormatUtils.GetParentIfText(previousNode), ListSelector);
		const endList = DOM.Closest(FormatUtils.GetParentIfText(endBlock), ListSelector);

		if (DOM.Utils.GetNodeName(endList) !== DOM.Utils.GetNodeName(previousList))
			return DOM.InsertAfter(previousList, endList);

		const listItems: Node[] = [];
		Arr.Each(DOM.GetChildNodes(endList), child => {
			if (
				DOM.Utils.IsText(child)
				|| (!DOM.Select('br', child) && Str.IsEmpty(DOM.GetText(child as HTMLElement)))
			) return;

			Arr.Push(listItems, child);
		});

		DOM.InsertAfter(DOM.Utils.GetLastChild(previousList), ...listItems);
	};

	const InsertFragment = (caret: ICaretData, fragment: DocumentFragment) => {
		const blockElements = DOM.SelectAll({
			tagName: Array.from(AllBlockFormats)
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