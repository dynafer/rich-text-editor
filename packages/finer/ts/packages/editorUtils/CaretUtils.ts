import Editor from 'finer/packages/Editor';

interface ILineData {
	Path: Node[],
	Line: number
}

export interface ICaretData {
	StartOffset: number,
	EndOffset: number,
	Start: {
		Path: Node[],
		Line: number,
		Node: Node
	},
	End: {
		Path: Node[],
		Line: number,
		Node: Node
	}
}

export interface ICaretUtils {
	GetLine: (node: Node) => ILineData,
	Get: () => ICaretData,
	Set: (node: Node, offset?: number) => void,
}

const CaretUtils = (editor: Editor): ICaretUtils => {
	let selection: Selection = editor.DOM.Win.getSelection() as Selection;

	const GetLine = (node: Node): ILineData => {
		const Path: Node[] = editor.DOM.GetParents(node);
		const lines: Node[] = Array.from(editor.EditArea.childNodes);

		const Line: number = lines.indexOf(Path[0]);

		return {
			Path,
			Line
		};
	};

	const Get = (): ICaretData => {
		selection = editor.DOM.Win.getSelection() as Selection;

		const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

		const StartLineData = GetLine(anchorNode as Node);
		const EndLineData = GetLine(focusNode as Node);

		return {
			StartOffset: anchorOffset,
			EndOffset: focusOffset,
			Start: {
				Path: StartLineData.Path,
				Line: StartLineData.Line,
				Node: anchorNode as Node
			},
			End: {
				Path: EndLineData.Path,
				Line: EndLineData.Line,
				Node: focusNode as Node
			}
		};
	};

	const Set = (node: Node, offset?: number) => {
		editor.DOM.Win.getSelection()?.setPosition(node, offset);
	};

	return {
		GetLine,
		Get,
		Set
	};
};

export default CaretUtils;