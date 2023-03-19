import { Arr, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import RangeUtils, { IRangeUtils } from './RangeUtils';

interface ILineData {
	Node: Node,
	Offset: number,
	Path: Node[],
	Line: number;
}

export interface ICaretData {
	IsRange: () => boolean,
	Start: ILineData,
	End: ILineData,
	SameRoot: Node,
	Range: IRangeUtils,
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

	const getLine = (node: Node, offset: number, bStart: boolean): ILineData => {
		const lines = DOM.GetChildNodes(self.GetBody());

		if (node === self.GetBody()) {
			const getChild = bStart ? DOM.Utils.GetFirstChild : DOM.Utils.GetLastChild;
			const current: Node | null = getChild(bStart ? lines[0] : lines[offset - 1], true);

			if (current) {
				node = current;
				offset = DOM.Utils.IsText(node) && !bStart ? node.length : 0;
			}
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
			const Start = getLine(range.startContainer, range.startOffset, true);
			const End = getLine(range.endContainer, range.endOffset, false);
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