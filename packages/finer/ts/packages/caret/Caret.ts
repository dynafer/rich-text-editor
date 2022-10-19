import Editor from 'finer/packages/Editor';

export class Caret {
	private win: Window;
	private selection: Selection;
	private editor: Editor;

	constructor(editor: Editor) {
		this.editor = editor;
		this.win = editor.DOM.Win;

		this.selection = this.win.getSelection() as Selection;
	}

	public Get() {
		this.selection = this.win.getSelection() as Selection;

		// const { anchorNode, anchorOffset, focusNode, focusOffset } = this.selection;
		// Fix me here...
	}
}