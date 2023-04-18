import Editor from '../../../packages/Editor';

const TableRow = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const InsertFromCaret = (bAbove: boolean) => {
		// FIX ME:: insert rows
	};

	const SelectFromCaret = () => {
		// FIX ME:: select rows
	};

	const DeleteFromCaret = () => {
		// FIX ME:: delete rows
	};

	return {
		InsertFromCaret,
		SelectFromCaret,
		DeleteFromCaret,
	};
};

export default TableRow;