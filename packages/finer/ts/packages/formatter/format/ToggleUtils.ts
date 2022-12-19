import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import { BlockFormatTags } from '../Format';
import FormatUtils from '../FormatUtils';

const ToggleUtils = () => {
	const getNodesInRoot = (node: Node, root: Node, bPrevious: boolean = false): Node[] => {
		const nodes: Node[] = [];
		let currentNode: Node | null = node;

		const getSibling = (selector: Node): Node | null => bPrevious ? selector.previousSibling : selector.nextSibling;

		while (currentNode) {
			if (currentNode.parentNode === root && !getSibling(currentNode)) break;
			if (!getSibling(currentNode)) {
				currentNode = currentNode.parentNode;
				continue;
			}

			currentNode = getSibling(currentNode);
			if (currentNode) Arr.Push(nodes, currentNode);
		}

		return nodes;
	};

	const GetTableItems = (editor: Editor, table: Node, bSelected: boolean): Node[] => {
		const DOM = editor.DOM;

		const selector = bSelected ? '[data-selected]' : ':not[data-selected]';

		return DOM.SelectAll(`td${selector}, th${selector}`);
	};

	const ExceptNodes = (editor: Editor, node: Node, root: Node, bPrevious: boolean = false): Node[] => {
		const self = editor;
		const DOM = self.DOM;

		const tableNode = DOM.Closest(FormatUtils.GetParentIfText(root) as Element, Array.from(BlockFormatTags.Table).join(','));
		if (!!tableNode) return GetTableItems(self, tableNode, false);

		return getNodesInRoot(node, root, bPrevious);
	};

	return {
		GetTableItems,
		ExceptNodes,
	};
};

export default ToggleUtils();