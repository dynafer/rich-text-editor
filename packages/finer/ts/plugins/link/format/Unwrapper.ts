import { NodeType } from '@dynafer/dom-control';
import { Arr } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { ICaretData } from '../../../packages/editorUtils/caret/CaretUtils';
import { IAnchorUtils } from './AnchorUtils';

const Unwrapper = (editor: Editor, utils: IAnchorUtils) => {
	const self = editor;
	const DOM = self.DOM;
	const formatUtils = self.Formatter.Utils;
	const CaretUtils = self.Utils.Caret;
	const RangeUtils = self.Utils.Range;

	const unwrapAll = (node: Node) => {
		const parentIfText = formatUtils.GetParentIfText(node);
		const anchors = DOM.SelectAll('a', parentIfText);
		Arr.Each(anchors, anchor => {
			const fragment = DOM.CreateFragment();
			DOM.Insert(fragment, ...DOM.GetChildNodes(anchor));
			anchor.parentNode?.replaceChild(fragment, anchor);
		});
	};

	const sameProcessor = (startNode: Node, endNode: Node, until: Node) => {
		const fragments: (DocumentFragment | Node | null)[] = [null, null, null];
		const foundPreviousSibling = utils.FindSibling(startNode, true);
		const foundNextSibling = utils.FindSibling(endNode, false);

		if (foundPreviousSibling) fragments[0] = utils.PutNodesIntoFragment(foundPreviousSibling, until, true)[0];
		if (foundNextSibling) Arr.Push(fragments, utils.PutNodesIntoFragment(foundNextSibling, until, false)[0]);

		const startFragment = utils.PutNodesIntoFragment(startNode, until, true)[0];
		utils.UnwrapAnchor(startFragment);
		fragments[1] = startFragment;

		if (startNode !== endNode) {
			const endFragment = utils.PutNodesIntoFragment(endNode, until, true)[0];
			utils.UnwrapAnchor(endFragment);
			fragments[2] = endFragment;
		}

		DOM.Insert(until, ...fragments);
	};

	const sameNodeProcessor = (caret: ICaretData): boolean => {
		if (!caret.IsRange() || caret.Start.Node !== caret.End.Node) return false;

		const node = caret.Start.Node;

		const splitedTextNode = formatUtils.SplitTextNode(self, node, caret.Start.Offset, caret.End.Offset);
		if (!NodeType.IsText(splitedTextNode)) return false;

		const newRange = RangeUtils();

		const closestAnchor = DOM.Closest(formatUtils.GetParentIfText(splitedTextNode), 'a');
		const until = utils.GetClosestBlock(splitedTextNode);

		if (!closestAnchor || !until) return false;

		sameProcessor(splitedTextNode, splitedTextNode, until);

		newRange.SetStartToEnd(splitedTextNode, 0, splitedTextNode.length);
		CaretUtils.UpdateRange(newRange);

		return true;
	};

	const sameLineProcessor = (startNode: Node, endNode: Node, until: Node) => {
		sameProcessor(startNode, endNode, until);

		const newRange = RangeUtils();
		newRange.SetStart(startNode, 0);
		newRange.SetEnd(endNode, endNode.textContent?.length ?? 0);
		CaretUtils.UpdateRange(newRange);

		return true;
	};

	const trimRangeEdge = (node: Node, until: Node, bStart: boolean) => {
		const [fragment, siblingForInsertion] = utils.PutNodesIntoFragment(node, until, !bStart);
		utils.UnwrapAnchor(fragment);
		const insertIn = bStart ? DOM.Insert : DOM.InsertFirst;
		const insertNext = bStart ? DOM.InsertAfter : DOM.InsertBefore;
		const insert = !!siblingForInsertion ? insertNext : insertIn;
		insert(siblingForInsertion ?? until, fragment);
	};

	const rangeProcessor = (caret: ICaretData): boolean => {
		if (!caret.IsRange()) return false;

		const startNode = utils.TrimTextsRangeEdge(caret.Start.Node, caret.Start.Offset, true);
		const endNode = utils.TrimTextsRangeEdge(caret.End.Node, caret.End.Offset);

		caret.Range.SetStart(startNode, startNode === caret.Start.Node ? caret.Start.Offset : 0);
		caret.Range.SetEnd(endNode, endNode.textContent?.length ?? 0);

		const startUntil = utils.GetClosestBlock(startNode);
		const endUntil = utils.GetClosestBlock(endNode);
		if (!startUntil || !endUntil) return false;

		if (startUntil === endUntil) {
			sameLineProcessor(startNode, endNode, startUntil);
			return true;
		}

		trimRangeEdge(startNode, startUntil, true);
		let currentNode: Node | null = startUntil;
		while (currentNode) {
			const parent: Node | null = currentNode.parentNode;
			const sibling: Node | null = currentNode.nextSibling;

			if (!sibling) {
				if (parent === self.GetBody()) break;
				currentNode = parent;
				continue;
			}

			if (DOM.Utils.IsChildOf(endUntil, sibling)) break;

			unwrapAll(sibling);

			currentNode = sibling;
		}

		currentNode = endUntil;
		while (currentNode) {
			const parent: Node | null = currentNode.parentNode;
			const sibling: Node | null = currentNode.previousSibling;

			if (!sibling) {
				if (parent === caret.End.Path[0]) break;
				currentNode = parent;
				continue;
			}

			unwrapAll(sibling);

			currentNode = sibling;
		}

		trimRangeEdge(endNode, endUntil, false);

		const newRange = RangeUtils();
		newRange.SetStart(startNode, startNode === caret.Start.Node ? caret.Start.Offset : 0);
		newRange.SetEnd(endNode, endNode.textContent?.length ?? 0);
		CaretUtils.UpdateRange(newRange);

		return true;
	};

	const caretProcessor = (caret: ICaretData): boolean => {
		if (caret.IsRange()) return false;

		const anchor = DOM.Closest(formatUtils.GetParentIfText(caret.Start.Node), 'a');
		if (!anchor) return false;

		formatUtils.RunFormatting(self, () => {
			const fragment = DOM.CreateFragment();
			DOM.Insert(fragment, ...DOM.GetChildNodes(anchor));
			anchor.parentNode?.replaceChild(fragment, anchor);
		});

		return true;
	};

	const UnwrapFromCaret = () => {
		const caret = CaretUtils.Get();
		if (!caret) return;

		const finish = () => {
			formatUtils.CleanDirtyWithCaret(self, CaretUtils.Get() ?? caret);
			self.Focus();
		};

		if (caretProcessor(caret)) return finish();
		if (sameNodeProcessor(caret)) return finish();
		if (rangeProcessor(caret)) return finish();
	};

	return {
		UnwrapFromCaret,
	};
};

export default Unwrapper;