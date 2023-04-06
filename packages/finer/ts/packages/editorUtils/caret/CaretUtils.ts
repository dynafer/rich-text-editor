import { NodeType } from '@dynafer/dom-control';
import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import { AllBlockFormats, BlockFormatTags } from '../../formatter/Format';
import RangeUtils, { IRangeUtils } from './RangeUtils';

interface ILineData {
	readonly Node: Node,
	readonly Offset: number,
	readonly Path: Element[],
	readonly Line: number,
}

export interface ICaretData {
	IsRange: () => boolean,
	IsBackward: () => boolean,
	readonly Start: ILineData,
	readonly End: ILineData,
	readonly SameRoot: Node,
	readonly Range: IRangeUtils,
}

export interface ICaretUtils {
	CleanRanges: () => void,
	Refresh: () => void,
	UpdateRange: (range: IRangeUtils) => void,
	CreateFake: (startNode: Node, startOffset: number, endNode: Node, endOffset: number) => ICaretData,
	Get: () => ICaretData | null,
}

const CaretUtils = (editor: Editor): ICaretUtils => {
	const self = editor;
	const DOM = self.DOM;

	let caret: ICaretData | null = null;

	const getDeepestSiblingChild = (node: Node, bPrevious: boolean): Node | null => {
		const siblingLine = bPrevious ? node.previousSibling : node.nextSibling;
		const getChild = bPrevious ? DOM.Utils.GetLastChild : DOM.Utils.GetFirstChild;
		const getChildReverse = bPrevious ? DOM.Utils.GetFirstChild : DOM.Utils.GetLastChild;

		if (siblingLine) return getChild(siblingLine, true);

		let parentSibling: Node | null = node.parentNode;
		while (parentSibling && parentSibling !== self.GetBody()) {
			if (AllBlockFormats.has(DOM.Utils.GetNodeName(parentSibling.previousSibling))) {
				parentSibling = parentSibling.previousSibling;
				break;
			}

			parentSibling = parentSibling.parentNode;
		}

		const getChildInSibling = !!parentSibling ? getChild : getChildReverse;
		return getChildInSibling(parentSibling ?? node, true);
	};

	const getLine = (node: Node, offset: number, bRange: boolean, bStart: boolean): ILineData => {
		const lines = self.GetLines(false);

		if (node === self.GetBody()) {
			const getChild = bStart ? DOM.Utils.GetFirstChild : DOM.Utils.GetLastChild;
			const current: Node | null = getChild(bStart ? lines[0] : lines[offset - 1], true);

			if (current) {
				node = current;
				offset = NodeType.IsText(node) && !bStart ? node.length : 0;
			}
		}

		const nodeName = DOM.Utils.GetNodeName(node);

		if (BlockFormatTags.Block.has(nodeName) && bRange && !bStart) {
			const deepestChild = getDeepestSiblingChild(node, offset === 0);
			if (deepestChild) node = deepestChild;
		}

		if (!bRange && AllBlockFormats.has(nodeName) && !DOM.Element.Figure.IsFigure(node)) {
			const getChild = bStart ? DOM.Utils.GetFirstChild : DOM.Utils.GetLastChild;
			const deepestChild = getChild(node, true);
			if (deepestChild) node = deepestChild;
		}

		const Path = DOM.GetParents(node);

		const Line = Arr.Find(lines, Path[0]);

		return {
			Node: node,
			Offset: offset,
			Path,
			Line,
		};
	};

	const CleanRanges = () => {
		const selection = DOM.Win.getSelection();
		selection?.removeAllRanges();
		caret = null;
	};

	const hasSelectedCells = (): boolean => {
		const cells = DOM.Element.Table.GetSelectedCells(self);
		if (!Arr.IsEmpty(cells)) {
			caret = null;
			return true;
		}

		return false;
	};

	const Refresh = () => {
		if (hasSelectedCells()) return;

		const selection = DOM.Win.getSelection();
		if (!selection) return;

		const range = selection.rangeCount === 0 ? null : selection.getRangeAt(0);
		if (!range || !DOM.Utils.IsChildOf(range.commonAncestorContainer, self.GetBody())) return;

		const bRange = !range.collapsed;
		const bBackward = selection.focusNode === range.startContainer;

		const IsRange = (): boolean => bRange;
		const IsBackward = () => bBackward;

		caret = {
			IsRange,
			IsBackward,
			Start: getLine(range.startContainer, range.startOffset, !range.collapsed, true),
			End: getLine(range.endContainer, range.endOffset, !range.collapsed, false),
			SameRoot: range.commonAncestorContainer,
			Range: RangeUtils(range),
		};
	};

	const UpdateRange = (range: IRangeUtils) => {
		if (hasSelectedCells()) return;
		CleanRanges();
		const selection = DOM.Win.getSelection();
		selection?.addRange(range.Get());
		Refresh();
	};

	const createFakeLineData = (node: Node, offset: number): ILineData => {
		const lines = self.GetLines(false);

		const Path = DOM.GetParents(node);
		const Line = Arr.Find(lines, Path[0]);

		return {
			Node: node,
			Offset: offset,
			Path,
			Line,
		};
	};

	const CreateFake = (startNode: Node, startOffset: number, endNode: Node, endOffset: number): ICaretData => {
		const Start = createFakeLineData(startNode, startOffset);
		const End = createFakeLineData(endNode, endOffset);

		let SameRoot: Node = startNode === endNode ? startNode : self.GetBody();
		if (startNode !== endNode) {
			for (let index = 0, length = Math.min(Start.Path.length, End.Path.length); index < length; ++index) {
				if (Start.Path[index] !== End.Path[index]) break;
				SameRoot = Start.Path[index];
			}
		}

		return {
			IsRange: () => startNode === endNode && startOffset === endOffset,
			IsBackward: () => false,
			Start,
			End,
			Range: RangeUtils(),
			SameRoot
		};
	};

	const Get = (): ICaretData | null => {
		Refresh();
		return caret;
	};

	return {
		CleanRanges,
		Refresh,
		UpdateRange,
		CreateFake,
		Get,
	};
};

export default CaretUtils;