import { NodeType } from '@dynafer/dom-control';
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

	const tableAndListSelector = Str.Join(',', ...[DOM.Element.Table.Selector, ...blockFormats.List]);

	const createListItem = (...nodes: Node[]): HTMLElement => {
		const newListItem = DOM.Create(Following);
		DOM.CloneAndInsert(newListItem, true, ...nodes);
		return newListItem;
	};

	const wrapNoesInTableItem = (item: Node): HTMLElement => {
		const newList = DOM.Create(Tag);

		Arr.Each(DOM.GetChildNodes(item, false), child => {
			if (DOM.Utils.IsBr(child)) return;

			if (Switchable.has(DOM.Utils.GetNodeName(child)))
				return DOM.CloneAndInsert(newList, true, ...DOM.GetChildNodes(child, false));

			const newListItem = createListItem(child);
			DOM.Insert(newList, newListItem);
		});

		return newList;
	};

	const wrapNodesInTable = (selectedList: Node[]) =>
		Arr.Each(selectedList, selected => {
			const newList = wrapNoesInTableItem(selected);

			if (!DOM.Utils.HasChildNodes(newList)) DOM.Insert(newList, DOM.Utils.WrapTagHTML(Following, '<br>'));

			(selected as Element).replaceChildren(newList);
		});

	const mergeList = (node: Node, insertion?: Node) => {
		if (!!node.previousSibling && DOM.Utils.GetNodeName(node.previousSibling) === Tag) {
			DOM.Insert(node.previousSibling, ...(!!insertion ? [insertion] : DOM.GetChildNodes(node, false)));
			return DOM.Remove(node, true);
		}

		if (!node.nextSibling || DOM.Utils.GetNodeName(node.nextSibling) !== Tag) return;

		const firstChild = DOM.Utils.GetFirstChild(node.nextSibling);
		const bFirstChild = !!firstChild;
		const insert = bFirstChild ? DOM.InsertBefore : DOM.Insert;
		const selector = bFirstChild ? firstChild : node.nextSibling;
		insert(selector, ...(!!insertion ? [insertion] : DOM.GetChildNodes(node, false)));
		DOM.Remove(node, true);
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
			return DOM.Remove(node, true);
		}

		if (node.nextSibling && DOM.Utils.GetNodeName(node.nextSibling) === Tag) {
			const firstChild = DOM.Utils.GetFirstChild(node.nextSibling);
			const bFirstChild = !!firstChild;
			const insert = bFirstChild ? DOM.InsertBefore : DOM.Insert;
			const selector = bFirstChild ? firstChild : node.nextSibling;
			insert(selector, ...[newListItem]);
			return DOM.Remove(node, true);
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

		Arr.Each(children, child => {
			if (child === startItem) bMiddle = true;

			const addable = bEnd ? endList : (bMiddle ? middleList : startList);
			DOM.CloneAndInsert(addable, true, child);

			if (child === endItem) bEnd = true;
		});

		const bStartFromMiddle = !DOM.Utils.HasChildNodes(startList);

		oldList.parentNode?.replaceChild(bStartFromMiddle ? middleList : startList, oldList);
		if (!bStartFromMiddle) DOM.InsertAfter(startList, middleList);
		if (DOM.Utils.HasChildNodes(endList)) DOM.InsertAfter(middleList, endList);
		mergeList(middleList);
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

		if (!DOM.Closest(target, tableAndListSelector)) {
			const blockNode = getBlock(target);
			if (!blockNode) return;
			return wrapBlock(blockNode);
		}

		const table = DOM.Element.Table.GetClosest(target);
		if (!!table) return;

		const follower = DOM.Closest(target, Following);
		if (!follower?.parentNode) return;

		const oldList = follower.parentNode;
		const children = DOM.GetChildNodes(oldList);
		const startItem = !bFromFirst ? follower : children[0];
		const endItem = !bFromFirst ? children[children.length - 1] : follower;
		wrapNodesInList(oldList, startItem, endItem);
	};

	const wrapNodesInSameLine = (root: Node, node?: Node, bFromFirst: boolean = false) => {
		if (!root) return;

		if (!Switchable.has(DOM.Utils.GetNodeName(root))) return wrapBlock(root);

		const children = DOM.GetChildNodes(root, false);

		if (!node) return wrapNodesInList(root, children[0], children[children.length - 1]);

		let item;
		Arr.Each(children, child => {
			if (!DOM.Utils.IsChildOf(node, child)) return;
			item = child;
		});

		if (!item) return;

		wrapNodesInList(root, !bFromFirst ? item : children[0], !bFromFirst ? children[children.length - 1] : item);
	};

	const wrapNodesInTableCell = (root: Node, startNode: Node, endNode: Node) => {
		const rootChildren = DOM.GetChildNodes(root, true);
		let bStart = false;

		const wrapBlockBeforeWrapList = (node: Node): Node => {
			const paragraph = DOM.Create('p');
			DOM.CloneAndInsert(paragraph, true, node);
			node.parentNode?.replaceChild(paragraph, node);
			return paragraph;
		};

		const wrapNodeInTableCell = (child: Node, marker?: Node | null, bPrevious?: boolean) => {
			if (DOM.Utils.IsBr(child)) return DOM.Remove(child);

			const bChildText = NodeType.IsText(child);
			const node = bChildText ? wrapBlockBeforeWrapList(child) : child;
			if (bChildText && marker) {
				const insert = bPrevious ? DOM.InsertBefore : DOM.InsertAfter;
				insert(node.firstChild, marker);
			}
			wrapNodesInSameLine(node);
		};

		Arr.Each(rootChildren, (child, exit) => {
			if (DOM.Utils.IsChildOf(startNode, child)) {
				bStart = true;
				const marker = DOM.HasAttr(child.previousSibling, 'marker') ? child.previousSibling : null;
				return wrapNodeInTableCell(child, marker, true);
			}

			if (DOM.Utils.IsChildOf(endNode, child)) {
				const marker = DOM.HasAttr(child.nextSibling, 'marker') ? child.nextSibling : null;
				wrapNodeInTableCell(child, marker);
				return exit();
			}

			if (bStart) wrapNodeInTableCell(child);
		});
	};

	const processSameLine = (caret: ICaretData) => {
		if (caret.Start.Line !== caret.End.Line) return;

		const startNode = formatUtils.GetParentIfText(caret.Start.Node);
		const endNode = formatUtils.GetParentIfText(caret.End.Node);

		if (!DOM.Closest(startNode, tableAndListSelector)) {
			const blockNode = getBlock(startNode);
			if (!blockNode) return;
			return wrapBlock(blockNode);
		}

		const table = DOM.Element.Table.GetClosest(startNode);
		if (!!table) {
			const selectedTableItems = DOM.Element.Table.GetSelectedCells(self, table);
			if (!Arr.IsEmpty(selectedTableItems)) return wrapNodesInTable(selectedTableItems);
		}

		const startListItem = DOM.Closest(startNode, Following);
		const endListItem = DOM.Closest(endNode, Following);

		if (startListItem?.parentNode && endListItem?.parentNode && startListItem.parentNode === endListItem.parentNode)
			return wrapNodesInList(startListItem.parentNode, startListItem, endListItem);

		if ((startListItem || endListItem)) {
			const rootChildren = DOM.GetChildNodes(caret.SameRoot);
			let bStart = false;

			Arr.Each(rootChildren, (child, exit) => {
				if (DOM.Utils.IsChildOf(caret.Start.Node, child)) {
					bStart = true;
					return wrapNodesInSameLine(child, caret.Start.Node);
				}

				if (DOM.Utils.IsChildOf(caret.End.Node, child)) {
					wrapNodesInSameLine(child, caret.End.Node, true);
					return exit();
				}

				if (bStart) wrapNodesInSameLine(child);
			});

			if (bStart) return;
		}

		const bRootTableCell = DOM.Element.Table.GetClosestCell(startNode) === DOM.Element.Table.GetClosestCell(endNode);
		if (!bRootTableCell) return;

		wrapNodesInTableCell(caret.SameRoot, caret.Start.Node, caret.End.Node);
	};

	const processRange = (caret: ICaretData) => {
		if (caret.Start.Line === caret.End.Line) return;

		const lines = DOM.GetChildren(self.GetBody());

		wrapRange(caret.Start.Node);
		for (let index = caret.Start.Line + 1; index < caret.End.Line; ++index) {
			const line = lines[index];

			const firstChild = DOM.Utils.GetFirstChild(line);
			if (!firstChild) continue;
			wrapRange(firstChild);
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