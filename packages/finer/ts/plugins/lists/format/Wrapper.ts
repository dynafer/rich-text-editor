import { Arr, Str } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { ICaretData } from '../../../packages/editorUtils/caret/CaretUtils';
import { IPluginListFormat } from '../Type';

const Wrapper = (editor: Editor, format: IPluginListFormat) => {
	const self = editor;
	const DOM = self.DOM;
	const formatter = self.Formatter;

	const formatUtils = formatter.Utils;
	const blockFormats = formatter.Formats.BlockFormatTags;
	const { Tag, Switchable, Following } = format;

	const tableSelector = formatter.Formats.TableSelector;
	const tableAndListSelector = Str.Join(',', ...[tableSelector, ...blockFormats.List]);

	const createListItem = (...nodes: Node[]): HTMLElement => {
		const newListItem = DOM.Create(Following);
		DOM.CloneAndInsert(newListItem, true, ...nodes);
		return newListItem;
	};

	const wrapNoesInTableItem = (item: Node): HTMLElement => {
		const newList = DOM.Create(Tag);

		for (const child of DOM.GetChildNodes(item, false)) {
			if (DOM.Utils.IsBr(child)) continue;

			if (Switchable.has(DOM.Utils.GetNodeName(child))) {
				DOM.CloneAndInsert(newList, true, ...DOM.GetChildNodes(child, false));
				continue;
			}

			const newListItem = createListItem(child);
			DOM.Insert(newList, newListItem);
		}

		return newList;
	};

	const wrapNodesInTable = (selectedList: Node[]) => {
		for (const selected of selectedList) {
			const newList = wrapNoesInTableItem(selected);

			if (!DOM.Utils.HasChildNodes(newList)) DOM.Insert(newList, DOM.Utils.WrapTagHTML(Following, '<br>'));

			(selected as Element).replaceChildren(newList);
		}
	};

	const mergeList = (node: Node, insertion?: Node): boolean => {
		if (!!node.previousSibling && DOM.Utils.GetNodeName(node.previousSibling) === Tag) {
			DOM.Insert(node.previousSibling, ...(!!insertion ? [insertion] : DOM.GetChildNodes(node, false)));
			DOM.Remove(node as Element, true);
			return true;
		}

		if (!node.nextSibling || DOM.Utils.GetNodeName(node.nextSibling) !== Tag) return false;

		const bFirstChild = !!node.nextSibling.firstChild;
		const insert = bFirstChild ? DOM.InsertBefore : DOM.Insert;
		const selector = bFirstChild ? node.nextSibling.firstChild : node.nextSibling;
		insert(selector, ...(!!insertion ? [insertion] : DOM.GetChildNodes(node, false)));
		DOM.Remove(node as Element, true);
		return true;
	};

	const switchFormat = (node: Node) => {
		if (!node.parentNode || !Switchable.has(DOM.Utils.GetNodeName(node))) return;

		const newList = DOM.Create(Tag);
		DOM.CloneAndInsert(newList, true, ...DOM.GetChildNodes(node, false));
		node.parentNode.replaceChild(newList, node);

		mergeList(newList);
	};

	const wrapBlock = (node: Node) => {
		if (!node.parentNode) return;

		const newListItem = createListItem(...DOM.GetChildNodes(node, false));

		if (node.previousSibling && DOM.Utils.GetNodeName(node.previousSibling) === Tag) {
			DOM.Insert(node.previousSibling, ...[newListItem]);
			DOM.Remove(node as Element, true);
			return;
		}

		if (node.nextSibling && DOM.Utils.GetNodeName(node.nextSibling) === Tag) {
			const bFirstChild = !!node.nextSibling.firstChild;
			const insert = bFirstChild ? DOM.InsertBefore : DOM.Insert;
			const selector = bFirstChild ? node.nextSibling.firstChild : node.nextSibling;
			insert(selector, ...[newListItem]);
			DOM.Remove(node as Element, true);
			return;
		}

		const newList = DOM.Create(Tag);
		DOM.Insert(newList, newListItem);
		node.parentNode.replaceChild(newList, node);
	};

	const wrapNodesInList = (oldList: Node, startItem: Node, endItem: Node) => {
		if (DOM.Utils.GetNodeName(oldList) === Tag) return;

		const children = DOM.GetChildNodes(oldList);

		if (children[0] === startItem && children[children.length - 1] === endItem)
			return switchFormat(oldList);

		const originalListName = DOM.Utils.GetNodeName(oldList);

		const startList = DOM.Create(originalListName);
		const middleList = DOM.Create(Tag);
		const endList = DOM.Create(originalListName);
		let bMiddle = false;
		let bEnd = false;

		for (const child of children) {
			if (child === startItem) bMiddle = true;

			const addable = bEnd ? endList : (bMiddle ? middleList : startList);
			DOM.CloneAndInsert(addable, true, child);

			if (child === endItem) bEnd = true;
		}

		const bStartFromMiddle = !DOM.Utils.HasChildNodes(startList);

		oldList.parentNode?.replaceChild(bStartFromMiddle ? middleList : startList, oldList);
		if (!bStartFromMiddle) DOM.InsertAfter(startList, middleList);
		if (DOM.Utils.HasChildNodes(endList)) DOM.InsertAfter(middleList, endList);
		return mergeList(middleList);
	};

	const getBlock = (node: Node): Node | null => {
		let current: Node | null = node;
		while (current && current !== self.GetBody()) {
			if (current.parentNode === self.GetBody()) break;
			current = current.parentNode;
		}
		return current;
	};

	const wrapRange = (node: Node, bFromFirst: boolean = false) => {
		if (!node) return;
		const target = formatUtils.GetParentIfText(node);

		if (!DOM.Closest(target as Element, tableAndListSelector)) {
			const blockNode = getBlock(target);
			if (!blockNode) return;
			return wrapBlock(blockNode);
		}

		const table = DOM.Closest(target as Element, tableSelector);
		if (!!table) return;

		const follower = DOM.Closest(target as Element, Following);
		if (follower?.parentNode) {
			const oldList = follower.parentNode;
			const children = DOM.GetChildNodes(oldList);
			const startItem = !bFromFirst ? follower : children[0];
			const endItem = !bFromFirst ? children[children.length - 1] : follower;
			return wrapNodesInList(oldList, startItem, endItem);
		}
	};

	const wrapNodesInSameLine = (root: Node, node?: Node, bFromFirst: boolean = false) => {
		if (!root) return;

		if (!Switchable.has(DOM.Utils.GetNodeName(root))) {
			wrapBlock(root);
			return;
		}

		const children = DOM.GetChildNodes(root, false);

		if (!node) return wrapNodesInList(root, children[0], children[children.length - 1]);

		let item;
		for (const child of children) {
			if (!DOM.Utils.IsChildOf(node, child)) continue;
			item = child;
		}

		if (!item) return;

		wrapNodesInList(root, !bFromFirst ? item : children[0], !bFromFirst ? children[children.length - 1] : item);
	};

	const processSameLine = (caret: ICaretData) => {
		if (caret.Start.Line !== caret.End.Line) return;

		const startNode = formatUtils.GetParentIfText(caret.Start.Node);
		const endNode = formatUtils.GetParentIfText(caret.End.Node);

		if (!DOM.Closest(startNode as Element, tableAndListSelector)) {
			const blockNode = getBlock(startNode);
			if (!blockNode) return;
			return wrapBlock(blockNode);
		}

		const table = DOM.Closest(startNode as Element, tableSelector);
		if (!!table) {
			const selectedTableItems = formatUtils.GetTableItems(self, true, table);
			if (!Arr.IsEmpty(selectedTableItems)) return wrapNodesInTable(selectedTableItems);
		}

		const startListItem = DOM.Closest(startNode as Element, Following);
		const endListItem = DOM.Closest(endNode as Element, Following);

		if (startListItem?.parentNode && endListItem?.parentNode && startListItem.parentNode === endListItem.parentNode)
			return wrapNodesInList(startListItem.parentNode, startListItem, endListItem);

		if ((startListItem || endListItem)) {
			const rootChildren = DOM.GetChildNodes(caret.SameRoot);
			let bStart = false;

			for (const child of rootChildren) {
				if (DOM.Utils.IsChildOf(startNode, child)) {
					bStart = true;
					wrapNodesInSameLine(child, startNode);
					continue;
				}

				if (DOM.Utils.IsChildOf(endNode, child)) {
					wrapNodesInSameLine(child, endNode, true);
					break;
				}

				if (bStart) wrapNodesInSameLine(child);
			}

			if (bStart) return;
		}
	};

	const processRange = (caret: ICaretData) => {
		if (caret.Start.Line === caret.End.Line) return;

		const lines = DOM.GetChildNodes(self.GetBody());

		wrapRange(caret.Start.Node);
		for (let index = caret.Start.Line + 1; index < caret.End.Line; ++index) {
			const line = lines[index];

			wrapRange(line.firstChild as Node);
		}
		wrapRange(caret.End.Node, true);
	};

	const WrapFromCaret = (caret: ICaretData) => {
		processSameLine(caret);
		processRange(caret);
	};

	return {
		WrapFromCaret
	};
};

export default Wrapper;