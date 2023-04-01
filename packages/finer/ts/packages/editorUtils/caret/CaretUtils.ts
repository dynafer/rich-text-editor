import { NodeType } from '@dynafer/dom-control';
import { Arr, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import { AllBlockFormats, BlockFormatTags } from '../../formatter/Format';
import RangeUtils, { IRangeUtils } from './RangeUtils';

interface ILineData {
	readonly Node: Node,
	readonly Offset: number,
	readonly Path: Node[],
	readonly Line: number,
}

export interface ICaretData {
	IsRange: () => boolean,
	readonly Start: ILineData,
	readonly End: ILineData,
	readonly SameRoot: Node,
	readonly Range: IRangeUtils,
}

export interface ICaretUtils {
	Clean: () => void,
	CleanRanges: () => void,
	UpdateRanges: (rangeUtils: IRangeUtils | IRangeUtils[]) => void,
	Get: () => ICaretData[],
}

const CaretUtils = (editor: Editor): ICaretUtils => {
	const self = editor;
	const DOM = self.DOM;

	let selection: Selection | null = null;
	const ranges: Range[] = [];

	const refreshRanges = () => {
		Arr.Clean(ranges);
		if (!selection) return;
		for (let rangeIndex = 0; rangeIndex < selection.rangeCount; ++rangeIndex) {
			const range = selection.getRangeAt(rangeIndex);
			Arr.Push(ranges, range);
		}
	};

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
		const lines = DOM.GetChildren(self.GetBody());

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

		const Path: Node[] = DOM.GetParents(node);

		const Line: number = Arr.Find(lines, Path[0]);

		return {
			Node: node,
			Offset: offset,
			Path,
			Line,
		};
	};

	const CleanRanges = () => {
		if (!selection) selection = DOM.Win.getSelection();
		selection?.removeAllRanges();
	};

	const UpdateRanges = (rangeUtils: IRangeUtils | IRangeUtils[]) => {
		CleanRanges();
		Arr.Clean(ranges);

		const newRanges = Type.IsArray(rangeUtils) ? rangeUtils : [rangeUtils];

		Arr.Each(newRanges, range => selection?.addRange(range.Get()));
	};

	const Get = (): ICaretData[] => {
		selection = DOM.Win.getSelection();
		refreshRanges();

		const CaretData: ICaretData[] = [];

		Arr.Each(ranges, range => {
			const IsRange = (): boolean => !range.collapsed;
			const Start = getLine(range.startContainer, range.startOffset, !range.collapsed, true);
			const End = getLine(range.endContainer, range.endOffset, !range.collapsed, false);
			const SameRoot = range.commonAncestorContainer;
			const Range = RangeUtils(range);

			Arr.Push(CaretData, {
				IsRange,
				Start,
				End,
				SameRoot,
				Range,
			});
		});

		return CaretData;
	};

	const Clean = () => {
		Arr.Clean(ranges);
		selection = null;
	};

	return {
		Clean,
		CleanRanges,
		UpdateRanges,
		Get,
	};
};

export default CaretUtils;