import Editor from 'finer/packages/Editor';

interface ILineData {
	Node: Node,
	Offset: number,
	Path: Node[],
	Line: number
}

export interface ICaretData {
	IsRange: boolean,
	Start: ILineData,
	End: ILineData,
	IsSameLine: boolean,
	SameRoot: Node,
}

export interface ICaretUtils {
	Get: () => ICaretData[],
	Set: (node: Node, offset?: number) => void,
}

const CaretUtils = (editor: Editor): ICaretUtils => {
	let ranges: Range[] = [];
	let selection: Selection = editor.DOM.Win.getSelection() as Selection;

	const setRanges = () => {
		ranges = [];
		for (let rangeIndex = 0; rangeIndex < selection.rangeCount; ++ rangeIndex) {
			const range = selection.getRangeAt(rangeIndex);
			if (range) ranges.push(range);
		}
	};

	const getLine = (node: Node, offset: number): ILineData => {
		const Path: Node[] = editor.DOM.GetParents(node);
		const lines: Node[] = Array.from(editor.GetBody().childNodes);

		const Line: number = lines.indexOf(Path[0]);

		return {
			Node: node,
			Offset: offset,
			Path,
			Line,
		};
	};

	const Get = (): ICaretData[] => {
		selection = editor.DOM.Win.getSelection() as Selection;
		setRanges();

		const CaretData: ICaretData[] = [];

		for (const range of ranges) {
			const IsRange = !range.collapsed;
			const Start = getLine(range.startContainer, range.startOffset);
			const End = getLine(range.endContainer, range.endOffset);
			const IsSameLine = Start.Path[0] === End.Path[0];
			const SameRoot = range.commonAncestorContainer;

			CaretData.push({
				IsRange,
				Start,
				End,
				IsSameLine,
				SameRoot,
			});
		}

		return CaretData;
	};

	const Set = (node: Node, offset?: number) => {
		editor.DOM.Win.getSelection()?.setPosition(node, offset);
	};

	return {
		Get,
		Set
	};
};

export default CaretUtils;