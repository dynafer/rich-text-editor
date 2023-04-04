import { NodeType } from '@dynafer/dom-control';
import { Arr } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { ICaretData } from '../../../packages/editorUtils/caret/CaretUtils';
import { IAnchorUtils } from './AnchorUtils';

const Wrapper = (editor: Editor, utils: IAnchorUtils) => {
	const self = editor;
	const DOM = self.DOM;
	const formats = self.Formatter.Formats;
	const formatUtils = self.Formatter.Utils;
	const CaretUtils = self.Utils.Caret;
	const RangeUtils = self.Utils.Range;

	const createAnchor = (url: string, child?: DocumentFragment | Node): HTMLAnchorElement => {
		const anchor = DOM.Create('a', {
			attrs: { href: url },
			children: [child ?? null]
		});
		DOM.SetAttr(anchor, 'href', anchor.href);
		return anchor;
	};

	const mergeAnchors = () => {
		const anchors = DOM.SelectAll<HTMLAnchorElement>('a', self.GetBody());

		Arr.WhileShift(anchors, anchor => {
			const previous = anchor.previousElementSibling;
			if (!DOM.Utils.IsAnchor(previous) || previous.href !== anchor.href) return;

			DOM.Insert(previous, ...DOM.GetChildNodes(anchor));
			anchor.remove();
		});
	};

	const wrapRecursive = (node: Node, url: string): void => {
		const nodeName = DOM.Utils.GetNodeName(node);
		if (formats.AllBlockFormats.has(nodeName) && !formats.BlockFormatTags.Block.has(nodeName))
			return Arr.Each(DOM.GetChildNodes(node), child => wrapRecursive(child, url));

		if (!formats.BlockFormatTags.Block.has(nodeName)) {
			const anchor = createAnchor(url);
			DOM.CloneAndInsert(anchor, true, node);
			utils.UnwrapAnchor(anchor);
			return node.parentElement?.replaceChild(anchor, node) as undefined;
		}

		const children = DOM.GetChildNodes(node);
		if (Arr.IsEmpty(children) || (children.length === 1 && DOM.Utils.IsBr(children[0]))) return;
		const anchor = createAnchor(url);
		DOM.Insert(anchor, ...children);
		utils.UnwrapAnchor(anchor);
		DOM.Insert(node, anchor);
	};

	const tableProcessor = (url: string): boolean => {
		const cells = DOM.Element.Table.GetSelectedCells(self);
		if (Arr.IsEmpty(cells)) return false;

		Arr.Each(cells, cell => wrapRecursive(cell, url));
		return true;
	};

	const sameProcessor = (startNode: Node, endNode: Node, until: Node, url: string) => {
		const fragments: (DocumentFragment | Node | null)[] = [null, null, null];
		const foundPreviousSibling = utils.FindSibling(startNode, true);
		const foundNextSibling = utils.FindSibling(endNode, false);

		if (foundPreviousSibling) fragments[0] = utils.PutNodesIntoFragment(foundPreviousSibling, until, true)[0];
		if (foundNextSibling) Arr.Push(fragments, utils.PutNodesIntoFragment(foundNextSibling, until, false)[0]);

		const startAnchor = createAnchor(url, utils.PutNodesIntoFragment(startNode, until, true)[0]);
		utils.UnwrapAnchor(startAnchor);
		fragments[1] = startAnchor;

		if (startNode !== endNode) {
			const endAnchor = createAnchor(url, utils.PutNodesIntoFragment(endNode, until, true)[0]);
			utils.UnwrapAnchor(endAnchor);
			fragments[2] = endAnchor;
		}

		DOM.Insert(until, ...fragments);
	};

	const sameNodeProcessor = (caret: ICaretData, url: string): boolean => {
		if (!caret.IsRange() || caret.Start.Node !== caret.End.Node) return false;

		const node = caret.Start.Node;

		const splitedTextNode = formatUtils.SplitTextNode(self, node, caret.Start.Offset, caret.End.Offset);
		if (!NodeType.IsText(splitedTextNode)) return false;

		const newRange = RangeUtils();

		const closestAnchor = DOM.Closest(formatUtils.GetParentIfText(splitedTextNode), 'a');
		const until = utils.GetClosestBlock(splitedTextNode);

		if (!closestAnchor || !until) {
			const cloned = DOM.Clone(splitedTextNode);
			const anchor = createAnchor(url, cloned);
			splitedTextNode.parentNode?.replaceChild(anchor, splitedTextNode);

			newRange.SetStartToEnd(cloned, 0, splitedTextNode.length);
			CaretUtils.UpdateRange(newRange);

			return true;
		}

		sameProcessor(splitedTextNode, splitedTextNode, until, url);

		newRange.SetStartToEnd(splitedTextNode, 0, splitedTextNode.length);
		CaretUtils.UpdateRange(newRange);

		return true;
	};

	const sameLineProcessor = (startNode: Node, endNode: Node, until: Node, url: string) => {
		sameProcessor(startNode, endNode, until, url);

		const newRange = RangeUtils();
		newRange.SetStart(startNode, 0);
		newRange.SetEnd(endNode, endNode.textContent?.length ?? 0);
		CaretUtils.UpdateRange(newRange);

		return true;
	};

	const trimRangeEdge = (node: Node, until: Node, url: string, bStart: boolean) => {
		const [fragment, siblingForInsertion] = utils.PutNodesIntoFragment(node, until, !bStart);
		const anchor = createAnchor(url, fragment);
		utils.UnwrapAnchor(anchor);
		const insertIn = bStart ? DOM.Insert : DOM.InsertFirst;
		const insertNext = bStart ? DOM.InsertAfter : DOM.InsertBefore;
		const insert = !!siblingForInsertion ? insertNext : insertIn;
		insert(siblingForInsertion ?? until, anchor);
	};

	const rangeProcessor = (caret: ICaretData, url: string): boolean => {
		if (!caret.IsRange()) return false;

		const startNode = utils.TrimTextsRangeEdge(caret.Start.Node, caret.Start.Offset, true);
		const endNode = utils.TrimTextsRangeEdge(caret.End.Node, caret.End.Offset);

		caret.Range.SetStart(startNode, startNode === caret.Start.Node ? caret.Start.Offset : 0);
		caret.Range.SetEnd(endNode, endNode.textContent?.length ?? 0);

		const startUntil = utils.GetClosestBlock(startNode);
		const endUntil = utils.GetClosestBlock(endNode);
		if (!startUntil || !endUntil) return false;

		if (startUntil === endUntil) {
			sameLineProcessor(startNode, endNode, startUntil, url);
			return true;
		}

		trimRangeEdge(startNode, startUntil, url, true);

		utils.ToggleAllInLine(
			startUntil,
			self.GetBody(),
			true,
			(sibling: Node) => wrapRecursive(sibling, url),
			(sibling: Node) => DOM.Utils.IsChildOf(endUntil, sibling)
		);

		utils.ToggleAllInLine(
			endUntil,
			caret.End.Path[0],
			false,
			(sibling: Node) => wrapRecursive(sibling, url)
		);

		trimRangeEdge(endNode, endUntil, url, false);

		const newRange = RangeUtils();
		newRange.SetStart(startNode, startNode === caret.Start.Node ? caret.Start.Offset : 0);
		newRange.SetEnd(endNode, endNode.textContent?.length ?? 0);
		CaretUtils.UpdateRange(newRange);

		return true;
	};

	const caretProcessor = (caret: ICaretData, url: string): boolean => {
		if (caret.IsRange()) return false;
		const existedAnchor = DOM.Closest<HTMLAnchorElement>(formatUtils.GetParentIfText(caret.Start.Node), 'a')
			?? DOM.Closest<HTMLAnchorElement>(formatUtils.GetParentIfText(caret.End.Node), 'a');

		if (existedAnchor) {
			if (DOM.GetHTML(existedAnchor) === DOM.GetAttr(existedAnchor, 'href')) DOM.SetText(existedAnchor, url);
			DOM.SetAttr(existedAnchor, 'href', url);
			DOM.SetAttr(existedAnchor, 'href', existedAnchor.href);
			return true;
		}

		const anchor = createAnchor(url, DOM.CreateTextNode(url));
		caret.Range.Insert(anchor);

		const newRange = RangeUtils();
		newRange.SetStartToEnd(DOM.Utils.GetFirstChild(anchor), url.length, url.length);
		CaretUtils.UpdateRange(newRange);

		return true;
	};

	const WrapFromCaret = (url: string) => {
		if (tableProcessor(url)) return;

		const caret = CaretUtils.Get();
		if (!caret) return;

		const finish = () => {
			formatUtils.CleanDirtyWithCaret(self, CaretUtils.Get() ?? caret);
			formatUtils.RunFormatting(self, mergeAnchors);
			self.Focus();
		};

		if (caretProcessor(caret, url)) return finish();
		if (sameNodeProcessor(caret, url)) return finish();
		if (rangeProcessor(caret, url)) return finish();
	};

	return {
		WrapFromCaret,
	};
};

export default Wrapper;