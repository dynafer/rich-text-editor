import Editor from 'finer/packages/Editor';

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

interface ILineData {
	Path: Node[],
	Line: number
}

class CaretUtils {
	private selection: Selection;
	private editor: Editor;

	constructor(editor: Editor) {
		this.editor = editor;

		this.selection = this.editor.DOM.Win.getSelection() as Selection;
	}

	public GetLine(node: Node): ILineData {
		const Path: Node[] = this.editor.DOM.GetParents(node);
		const lines: Node[] = Array.from(this.editor.EditArea.childNodes);

		const Line: number = lines.indexOf(Path[0]);

		return {
			Path,
			Line
		};
	}

	public Get(): ICaretData {
		this.selection = this.editor.DOM.Win.getSelection() as Selection;

		const { anchorNode, anchorOffset, focusNode, focusOffset } = this.selection;

		const StartLineData = this.GetLine(anchorNode as Node);
		const EndLineData = this.GetLine(focusNode as Node);

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
	}

	public Set(node: Node, offset?: number) {
		this.editor.DOM.Win.getSelection()?.setPosition(node, offset);
	}
}

export default CaretUtils;