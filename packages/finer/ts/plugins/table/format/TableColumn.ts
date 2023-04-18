import Editor from '../../../packages/Editor';

const TableColumn = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const InsertFromCaret = (bLeft: boolean) => {
		// FIX ME:: insert columns
	};

	const SelectFromCaret = () => {
		// FIX ME:: select columns
	};

	const DeleteFromCaret = () => {
		// FIX ME:: delete columns
	};

	return {
		InsertFromCaret,
		SelectFromCaret,
		DeleteFromCaret,
	};
};

export default TableColumn;