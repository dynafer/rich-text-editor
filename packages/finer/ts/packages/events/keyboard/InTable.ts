import { Arr } from '@dynafer/utils';
import { TableCellSelector, TableRowSelector } from '../../formatter/Format';
import Editor from '../../Editor';
import { PreventEvent } from '../EventSetupUtils';
import { EKeyCode, IsTableFigure } from './KeyboardUtils';

const InTable = (editor: Editor, event: KeyboardEvent) => {
	const bTab = event.key === EKeyCode.Tab || event.code === EKeyCode.Tab;
	const bShift = event.shiftKey;
	const bUp = event.key === EKeyCode.ArrowUp || event.code === EKeyCode.ArrowUp;
	const bDown = event.key === EKeyCode.ArrowDown || event.code === EKeyCode.ArrowDown;
	const bLeft = (bShift && bTab) || event.key === EKeyCode.ArrowLeft || event.code === EKeyCode.ArrowLeft;
	const bRight = (!bShift && bTab) || event.key === EKeyCode.ArrowRight || event.code === EKeyCode.ArrowRight;

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
	const cell = DOM.Closest(fromElement, TableCellSelector);
	if (!row || !cell) return CaretUtils.Clean();

	const cellIndex = Arr.Find(DOM.GetChildNodes(row, false), cell);
	if (cellIndex === -1) return CaretUtils.Clean();

	const newRange = self.Utils.Range();

	const findAndUpdate = (bPrevious: boolean, node: Node) => {
		const getChild = !bPrevious ? DOM.Utils.GetFirstChild : DOM.Utils.GetLastChild;
		let findNode: Node | null = getChild(node, true);
		if (DOM.Utils.IsBr(findNode)) findNode = findNode.parentNode;
		if (!findNode) findNode = node;

		const position = DOM.Utils.IsText(findNode)
			? (bPrevious ? findNode.length : 0)
			: 0;

		newRange.SetStartToEnd(findNode, position, position);
		CaretUtils.UpdateRanges([newRange.Get()]);
		self.Dispatch('caret:change', []);
	};

	const insertOrMove = (bPrevious: boolean) => {
		const moveTo = bPrevious ? line.previousSibling : line.nextSibling;
		if (moveTo) return findAndUpdate(bPrevious, moveTo);

		const paragraph = self.CreateEmptyParagraph();
		const insert = bPrevious ? DOM.InsertBefore : DOM.InsertAfter;
		insert(line, paragraph);
		newRange.SetStartToEnd(paragraph, 0, 0);
		CaretUtils.UpdateRanges([newRange.Get()]);
		return self.Dispatch('caret:change', []);
	};

	if (bLeft || bRight) {
		const rows = DOM.SelectAll(TableRowSelector, line);
		const cells = DOM.SelectAll(TableCellSelector, line);

		const targetRowIndex = bLeft ? 0 : rows.length - 1;
		const targetCellIndex = bLeft ? 0 : cells.length - 1;

		if (row !== rows[targetRowIndex] || cell !== cells[targetCellIndex]) {
			if (!bTab) return CaretUtils.Clean();

			PreventEvent(event);
			const nextCellIndex = Arr.Find(cells, cell);
			return findAndUpdate(bLeft, cells[nextCellIndex + (bShift ? -1 : 1)]);
		}

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
	for (const eachCell of DOM.GetChildNodes(targetRow)) {
		const colspan = parseInt(DOM.GetAttr(eachCell, 'colspan') ?? '0');

		if (!colspan || colspan <= 1) {
			Arr.Push(cells, eachCell);
			continue;
		}

		for (let index = 0; index < colspan; ++index) {
			Arr.Push(cells, eachCell);
		}
	}

	const targetCell = cells[cellIndex];
	if (!targetCell) return CaretUtils.Clean();

	return findAndUpdate(false, targetCell);
};

export default InTable;