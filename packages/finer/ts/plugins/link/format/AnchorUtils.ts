import { NodeType } from '@dynafer/dom-control';
import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../../packages/Editor';

export interface IAnchorUtils {
	GetClosestBlock: (node: Node) => Node | null,
	UnwrapAnchor: (targetAnchor: Node) => void,
	TrimTextsRangeEdge: (node: Node, offset: number, bPrevious?: boolean) => Node,
	FindSibling: (node: Node, bPrevious: boolean) => Node | null,
	PutNodesIntoFragment: (node: Node, until: Node, bPrevious: boolean) => [DocumentFragment, (Node | null)],
	ToggleAllInLine: (block: Node, until: Node, bNext: boolean, toggle: (sibling: Node) => void, checkExit?: (sibling: Node) => boolean) => void,
}

const AnchorUtils = (editor: Editor): IAnchorUtils => {
	const self = editor;
	const DOM = self.DOM;
	const formats = self.Formatter.Formats;
	const formatUtils = self.Formatter.Utils;

	const GetClosestBlock = (node: Node): Node | null =>
		DOM.Closest(formatUtils.GetParentIfText(node), Str.Join(',', ...formats.BlockFormatTags.Block))
		?? DOM.Closest(formatUtils.GetParentIfText(node), formats.ListItemSelector);

	const UnwrapAnchor = (targetAnchor: Node) =>
		Arr.Each(editor.DOM.SelectAll('a', targetAnchor), anchor => {
			const fragment = editor.DOM.CreateFragment();
			const parent = anchor.parentNode;
			editor.DOM.Insert(fragment, ...editor.DOM.GetChildNodes(anchor));
			parent?.replaceChild(fragment, anchor);
		});

	const TrimTextsRangeEdge = (node: Node, offset: number, bPrevious: boolean = false): Node => {
		const text = node.textContent;
		if (!text) return node;

		const splitedTextNode = formatUtils.SplitTextNode(self, node,
			bPrevious ? offset : 0,
			bPrevious ? text.length : offset
		);
		if (!splitedTextNode) return node;

		return splitedTextNode;
	};

	const FindSibling = (node: Node, bPrevious: boolean): Node | null => {
		let foundSibling: Node | null = node;
		while (foundSibling) {
			const sibling = bPrevious ? foundSibling.previousSibling : foundSibling.nextSibling;
			if (sibling) {
				foundSibling = sibling;
				break;
			}

			foundSibling = foundSibling.parentNode;
		}

		if (NodeType.IsText(foundSibling) || DOM.Utils.IsBr(foundSibling)) return foundSibling;

		const getChild = bPrevious ? DOM.Utils.GetLastChild : DOM.Utils.GetFirstChild;
		return getChild(foundSibling, true);
	};

	const PutNodesIntoFragment = (node: Node, until: Node, bPrevious: boolean): [DocumentFragment, (Node | null)] => {
		const fragment = DOM.CreateFragment();

		let siblingForInsertion: Node | null = null;
		let current: Node | null = node.parentNode;
		let sibling: Node | null = node;

		const insert = bPrevious ? DOM.InsertFirst : DOM.Insert;
		const insertReverse = bPrevious ? DOM.Insert : DOM.InsertFirst;

		while (current && current !== self.GetBody()) {
			const cloned = DOM.Clone(current);

			if (current === until) siblingForInsertion = (bPrevious ? sibling?.nextSibling : sibling?.previousSibling) ?? null;

			while (sibling) {
				const nextSibling: Node | null = bPrevious ? sibling.previousSibling : sibling.nextSibling;
				insert(cloned, sibling);
				sibling = nextSibling;
			}

			if (DOM.Utils.HasChildNodes(fragment)) insertReverse(cloned, ...DOM.GetChildNodes(fragment));

			if (current === until) {
				DOM.Insert(fragment, ...DOM.GetChildNodes(cloned));
				break;
			}

			DOM.Insert(fragment, cloned);

			sibling = bPrevious ? current.previousSibling : current.nextSibling;
			current = current.parentNode;
		}

		return [fragment, siblingForInsertion];
	};

	const ToggleAllInLine = (block: Node, until: Node, bNext: boolean, toggle: (sibling: Node) => void, checkExit?: (sibling: Node) => boolean) => {
		let currentNode: Node | null = block;

		while (currentNode) {
			const parent: Node | null = currentNode.parentNode;
			const sibling: Node | null = bNext ? currentNode.nextSibling : currentNode.previousSibling;

			if (!sibling) {
				if (parent === until) break;
				currentNode = parent;
				continue;
			}

			if (Type.IsFunction(checkExit) && checkExit(sibling)) break;

			toggle(sibling);

			currentNode = sibling;
		}
	};

	return {
		GetClosestBlock,
		UnwrapAnchor,
		TrimTextsRangeEdge,
		FindSibling,
		PutNodesIntoFragment,
		ToggleAllInLine,
	};
};

export default AnchorUtils;