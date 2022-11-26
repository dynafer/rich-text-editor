import { Arr } from '@dynafer/utils';
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
	IsSameLine: () => boolean,
	SameRoot: Node,
	Range: IRangeUtils,
}

export interface ICaretUtils {
	Get: (bNeedCheckUpdate?: boolean) => ICaretData[],
	UpdateRanges: (newRanges: Range[]) => void;
	Clean: () => void,
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
			ranges.push(range);
		}
	};

	const getLine = (node: Node, offset: number): ILineData => {
		const Path: Node[] = DOM.GetParents(node);
		const lines: Node[] = Array.from(self.GetBody().childNodes);

		const Line: number = lines.indexOf(Path[0]);

		return {
			Node: node,
			Offset: offset,
			Path,
			Line,
		};
	};

	const isUpdatable = (): boolean => ranges.length <= 1;

	const Get = (bNeedCheckUpdate: boolean = false): ICaretData[] => {
		if (!bNeedCheckUpdate || (bNeedCheckUpdate && isUpdatable())) {
			selection = DOM.Win.getSelection();
			refreshRanges();
		}

		const CaretData: ICaretData[] = [];

		for (const range of ranges) {
			const IsRange = (): boolean => !range.collapsed;
			const Start = getLine(range.startContainer, range.startOffset);
			const End = getLine(range.endContainer, range.endOffset);
			const IsSameLine = (): boolean => Start.Path[0] === End.Path[0];
			const SameRoot = range.commonAncestorContainer;
			const Range = RangeUtils(range);

			CaretData.push({
				IsRange,
				Start,
				End,
				IsSameLine,
				SameRoot,
				Range,
			});
		}

		return CaretData;
	};

	const UpdateRanges = (newRanges: Range[]) => {
		selection?.removeAllRanges();
		Arr.Clean(ranges);

		for (const range of newRanges) {
			selection?.addRange(range);
		}
	};

	const Clean = () => {
		Arr.Clean(ranges);
		selection = null;
	};

	return {
		Get,
		UpdateRanges,
		Clean,
	};
};

export default CaretUtils;