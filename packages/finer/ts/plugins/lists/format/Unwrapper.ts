import { Arr, Str } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { ICaretData } from '../../../packages/editorUtils/caret/CaretUtils';
import { IPluginListFormat } from '../Type';

const Unwrapper = (editor: Editor, format: IPluginListFormat) => {
	const self = editor;
	const DOM = self.DOM;

	const formatUtils = self.Formatter.Utils;
	const blockFormats = self.Formatter.BlockFormats;
	const { Tag, UnsetSwitcher } = format;

	const tableSelector = 'table';
	const tableItemsSelector = Str.Join(',', ...blockFormats.TableItems);
	const tableRowSelector = 'tr';

	const unwrap = (oldList: Node, start: Node, end: Node, bTable: boolean = false) => {
		const startList = DOM.Create(Tag);
		const middleNodes: Node[] = [];
		const endList = DOM.Create(Tag);

		const children = DOM.GetChildNodes(oldList);

		let bMiddle = false;
		let bEnd = false;

		for (const child of children) {
			if (DOM.Utils.IsChildOf(start, child)) bMiddle = true;

			if (bMiddle && !bEnd) {
				for (const node of DOM.GetChildNodes(child)) {
					if (DOM.Utils.IsBr(node)) continue;
					Arr.Push(middleNodes, DOM.Clone(node, true));
				}
			} else {
				const addable = bEnd ? endList : startList;
				DOM.CloneAndInsert(addable, true, child);
			}

			if (DOM.Utils.IsChildOf(end, child)) bEnd = true;
		}

		const bStartFromMiddle = !DOM.Utils.HasChildNodes(startList);

		if (!bStartFromMiddle) oldList.parentNode?.replaceChild(startList, oldList);

		let lastChildInMiddleNodes;

		if (bTable) {
			if (bStartFromMiddle) oldList.parentNode?.replaceChild(middleNodes[0], oldList);
			else DOM.InsertAfter(startList, middleNodes[0]);

			for (let index = 1, length = middleNodes.length; index < length; ++index) {
				DOM.InsertAfter(middleNodes[index - 1], middleNodes[index]);
			}

			lastChildInMiddleNodes = middleNodes[middleNodes.length - 1];
		} else {
			const block = DOM.Create(UnsetSwitcher);
			DOM.Insert(block, ...middleNodes);

			if (bStartFromMiddle) oldList.parentNode?.replaceChild(block, oldList);
			else DOM.InsertAfter(startList, block);

			lastChildInMiddleNodes = block;
		}

		if (DOM.Utils.HasChildNodes(endList)) DOM.InsertAfter(lastChildInMiddleNodes, endList);
	};

	const unwrapNodesInTable = (selectedList: Node[]) => {
		for (const selected of selectedList) {
			const lists = DOM.SelectAll(Tag, selected);
			if (Arr.IsEmpty(lists)) continue;

			for (const list of lists) {
				if (!list.firstChild || !list.lastChild) continue;

				unwrap(list, list.firstChild, list.lastChild, true);
			}
		}
	};

	const unwrapRange = (node: Node, bFromFirst: boolean = false) => {
		if (!node) return;
		const target = formatUtils.GetParentIfText(node);

		const table = DOM.Closest(target as Element, tableSelector);
		if (!!table) return;

		const oldList = DOM.Closest(target as Element, Tag);
		if (!oldList) return;

		const children = DOM.GetChildNodes(oldList);
		const startChild = !bFromFirst ? node : children[0];
		const endChild = !bFromFirst ? children[children.length - 1] : node;
		unwrap(oldList, startChild, endChild, !!DOM.Closest(target as Element, tableSelector));
	};

	const processSameLine = (caret: ICaretData) => {
		if (caret.Start.Line !== caret.End.Line) return;

		const target = formatUtils.GetParentIfText(caret.Start.Node);

		const oldList = DOM.Closest(target as Element, Tag);
		const table = DOM.Closest(target as Element, tableSelector);
		if (!oldList && !table) return;

		if (table) {
			const selectedTableItems = formatUtils.GetTableItems(self, table, true);
			if (!Arr.IsEmpty(selectedTableItems)) return unwrapNodesInTable(selectedTableItems);
		}

		const tableCell = DOM.Closest(target as Element, tableItemsSelector);
		if (DOM.Utils.GetNodeName(tableCell) === tableRowSelector) return;

		if (!tableCell && oldList) return unwrap(oldList, caret.Start.Node, caret.End.Node);

		if (!tableCell) return;

		const children = DOM.GetChildNodes(tableCell);
		let bStart = false;

		for (const child of children) {
			const bHasStart = !!DOM.Utils.IsChildOf(caret.Start.Node, child);
			const bHasEnd = !!DOM.Utils.IsChildOf(caret.End.Node, child);
			if (bHasStart) bStart = true;
			if (!bStart) continue;

			if (DOM.Utils.GetNodeName(child) === Tag && child.firstChild && child.lastChild) {
				const startNode = bHasStart ? caret.Start.Node : child.firstChild;
				const endNode = bHasEnd ? caret.End.Node : child.lastChild;

				unwrap(child, startNode, endNode, true);
			}

			if (bHasEnd) break;
		}
	};

	const processRange = (caret: ICaretData) => {
		if (caret.Start.Line === caret.End.Line) return;

		const lines = DOM.GetChildNodes(self.GetBody());

		unwrapRange(caret.Start.Node);
		for (let index = caret.Start.Line + 1; index < caret.End.Line; ++index) {
			const line = lines[index];

			unwrapRange(line.firstChild as Node);
		}
		unwrapRange(caret.End.Node, true);
	};

	const UnwrapFromCaret = (caret: ICaretData) => {
		self.Focus();

		processSameLine(caret);
		processRange(caret);
	};

	return {
		UnwrapFromCaret
	};
};

export default Unwrapper;