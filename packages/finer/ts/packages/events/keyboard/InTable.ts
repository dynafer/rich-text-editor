import { Arr } from '@dynafer/utils';
import { TableCellSelector, TableRowSelector } from '../../formatter/Format';
import Editor from '../../Editor';
import { PreventEvent } from '../EventSetupUtils';
import { EKeyCode, IsTableFigure } from './KeyboardUtils';

const InTable = (editor: Editor, event: KeyboardEvent) => {
	const bUp = event.key === EKeyCode.ArrowUp || event.code === EKeyCode.ArrowUp;
	const bDown = event.key === EKeyCode.ArrowDown || event.code === EKeyCode.ArrowDown;
	const bLeft = event.key === EKeyCode.ArrowLeft || event.code === EKeyCode.ArrowLeft;
	const bRight = event.key === EKeyCode.ArrowRight || event.code === EKeyCode.ArrowRight;

	if (!bUp && !bDown && !bLeft && !bRight) return;

	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const caret = CaretUtils.Get()[0];
	const line = bUp || bLeft ? caret.Start.Path[0] : caret.End.Path[0];
	if (!IsTableFigure(self, line)) return CaretUtils.Clean();

	const from = bUp || bLeft ? caret.Start.Node : caret.End.Node;
	const fromElement = (DOM.Utils.IsText(from) ? from.parentNode : from) as Element;
	const row = DOM.Closest(fromElement, TableRowSelector);
	const column = DOM.Closest(fromElement, TableCellSelector);
	if (!row || !column) return CaretUtils.Clean();

	const columnIndex = Arr.Find(DOM.GetChildNodes(row, false), column);
	if (columnIndex === -1) return CaretUtils.Clean();

	const newRange = self.Utils.Range();

	const findAndUpdate = (bPrevious: boolean, node: Node) => {
		let findNode: Node | null = node;
		while (findNode) {
			if (DOM.Utils.IsText(findNode) || DOM.Utils.IsBr(findNode)) break;
			findNode = bPrevious ? findNode.lastChild : findNode.firstChild;
		}
		if (!findNode) findNode = node;

		const position = DOM.Utils.IsText(findNode)
			? (bPrevious ? findNode.length : 0)
			: 0;
		newRange.SetStartToEnd(findNode, position, position);
		CaretUtils.UpdateRanges([newRange.Get()]);
	};

	const insertOrMove = (bPrevious: boolean) => {
		const moveTo = bPrevious ? line.previousSibling : line.nextSibling;
		if (moveTo) return findAndUpdate(bPrevious, moveTo);

		const paragraph = self.CreateEmptyParagraph();
		const insert = bPrevious ? DOM.InsertBefore : DOM.InsertAfter;
		insert(line, paragraph);
		newRange.SetStartToEnd(paragraph, 0, 0);
		return CaretUtils.UpdateRanges([newRange.Get()]);
	};

	if (bLeft || bRight) {
		const rows = DOM.SelectAll(TableRowSelector, line);
		const cells = DOM.SelectAll(TableCellSelector, line);

		const rowIndex = bLeft ? 0 : rows.length - 1;
		const cellIndex = bLeft ? 0 : cells.length - 1;

		if (row !== rows[rowIndex] || column !== cells[cellIndex]) return CaretUtils.Clean();

		PreventEvent(event);

		return insertOrMove(bLeft);
	}

	PreventEvent(event);
	const sibling = bUp ? row.previousSibling : row.nextSibling;
	let targetRow = sibling;
	if (!targetRow) {
		if (!row.parentNode) return CaretUtils.Clean();

		const bGroup = Arr.Contains(['thead', 'tbody', 'tfoot'], DOM.Utils.GetNodeName(row.parentNode));
		const parentSibling = bUp ? row.parentNode.previousSibling : row.parentNode.nextSibling;
		if (!bGroup || !parentSibling) return insertOrMove(bUp);

		const toRows = DOM.SelectAll(TableRowSelector, parentSibling);
		const toRow = toRows[bUp ? toRows.length - 1 : 0];
		if (!toRow) return CaretUtils.Clean();

		targetRow = toRow;
	}

	const cells: Node[] = [];
	for (const cell of DOM.GetChildNodes(targetRow)) {
		const colspan = parseInt(DOM.GetAttr(cell, 'colspan') ?? '0');

		if (!colspan || colspan <= 0) {
			Arr.Push(cells, cell);
			continue;
		}

		for (let index = 0; index < colspan; ++index) {
			Arr.Push(cells, cell);
		}
	}

	const targetCell = cells[columnIndex];
	if (!targetCell) return CaretUtils.Clean();

	return findAndUpdate(false, targetCell);
};

export default InTable;