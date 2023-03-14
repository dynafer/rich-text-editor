import { Arr } from '@dynafer/utils';
import { GetTableGridWithIndex, ITableGrid } from '../../dom/tools/table/TableToolsUtils';
import Editor from '../../Editor';
import { IRangeUtils } from '../../editorUtils/caret/RangeUtils';
import { TableCellSelector, TableRowSelector, TableSelector } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';
import { PreventEvent } from '../EventSetupUtils';
import { EKeyCode, IsTableFigure } from './KeyboardUtils';

const InTable = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const findAndUpdate = (range: IRangeUtils, node: Node, bPrevious: boolean) => {
		const getChild = !bPrevious ? DOM.Utils.GetFirstChild : DOM.Utils.GetLastChild;
		let findNode: Node | null = getChild(node, true);
		if (DOM.Utils.IsBr(findNode)) findNode = findNode.parentNode;
		if (!findNode) findNode = node;

		const position = DOM.Utils.IsText(findNode)
			? (bPrevious ? findNode.length : 0)
			: 0;

		range.SetStartToEnd(findNode, position, position);
		CaretUtils.UpdateRanges([range.Get()]);
		self.Dispatch('caret:change', []);
	};

	const insertOrMove = (range: IRangeUtils, line: Node, bPrevious: boolean) => {
		const moveTo = bPrevious ? line.previousSibling : line.nextSibling;
		if (moveTo) return findAndUpdate(range, moveTo, bPrevious);

		const paragraph = self.CreateEmptyParagraph();
		const insert = bPrevious ? DOM.InsertBefore : DOM.InsertAfter;
		insert(line, paragraph);
		range.SetStartToEnd(paragraph, 0, 0);
		CaretUtils.UpdateRanges([range.Get()]);
		return self.Dispatch('caret:change', []);
	};

	const getLineInCell = (cell: HTMLElement, node: Node): Node => {
		let current: Node | null = node;
		while (current) {
			const parent: Node | null = current.parentNode;
			if (!parent || parent === cell) return current;

			current = parent;
		}

		return current;
	};

	const isNextCell = (startNode: Node, endNode: Node, cell: HTMLElement, bPrevious: boolean): boolean => {
		const startLine = getLineInCell(cell, startNode);
		const endLine = getLineInCell(cell, endNode);

		return bPrevious ? !!startLine.previousSibling : !!endLine.nextSibling;
	};

	const upDownEvent = (event: KeyboardEvent, line: Node, tableGrid: ITableGrid) => {
		const bUp = event.key === EKeyCode.ArrowUp || event.code === EKeyCode.ArrowUp;

		const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;

		const caret = CaretUtils.Get()[0];

		if (isNextCell(caret.Start.Node, caret.End.Node, Grid[TargetCellRowIndex][TargetCellIndex], bUp)) return;

		PreventEvent(event);

		const newRange = self.Utils.Range();

		const siblingRowIndex = TargetCellRowIndex + (bUp ? -1 : 1);
		if (siblingRowIndex < 0 || siblingRowIndex >= Grid.length) return insertOrMove(newRange, line, bUp);

		const targetCell = Grid[siblingRowIndex][TargetCellIndex];

		if (!targetCell) return CaretUtils.Clean();

		return findAndUpdate(newRange, targetCell, bUp);
	};

	const leftRightEvent = (event: KeyboardEvent, line: Node, row: Element, cell: Element) => {
		const bTab = event.key === EKeyCode.Tab || event.code === EKeyCode.Tab;
		const bShift = event.shiftKey;
		const bLeft = (bShift && bTab) || event.key === EKeyCode.ArrowLeft || event.code === EKeyCode.ArrowLeft;

		const caret = CaretUtils.Get()[0];

		if (isNextCell(caret.Start.Node, caret.End.Node, cell as HTMLElement, bLeft)) return;

		const rows = DOM.SelectAll(TableRowSelector, line);
		const cells = DOM.SelectAll(TableCellSelector, line);

		const targetRowIndex = bLeft ? 0 : rows.length - 1;
		const targetCellIndex = bLeft ? 0 : cells.length - 1;

		if (row !== rows[targetRowIndex] || cell !== cells[targetCellIndex]) {
			if (!bTab) return CaretUtils.Clean();

			PreventEvent(event);
			const nextCellIndex = Arr.Find(cells, cell);
			return findAndUpdate(self.Utils.Range(), cells[nextCellIndex + (bShift ? -1 : 1)], bLeft);
		}

		PreventEvent(event);

		return insertOrMove(self.Utils.Range(), line, bLeft);
	};

	const KeyDownEvent = (e: Editor, event: KeyboardEvent) => {
		const bTab = event.key === EKeyCode.Tab || event.code === EKeyCode.Tab;
		const bShift = event.shiftKey;
		const bUp = event.key === EKeyCode.ArrowUp || event.code === EKeyCode.ArrowUp;
		const bDown = event.key === EKeyCode.ArrowDown || event.code === EKeyCode.ArrowDown;
		const bLeft = (bShift && bTab) || event.key === EKeyCode.ArrowLeft || event.code === EKeyCode.ArrowLeft;
		const bRight = (!bShift && bTab) || event.key === EKeyCode.ArrowRight || event.code === EKeyCode.ArrowRight;

		if (!bUp && !bDown && !bLeft && !bRight) return;

		const caret = CaretUtils.Get()[0];
		const line = bLeft ? caret.Start.Path[0] : caret.End.Path[0];
		if (!IsTableFigure(self, line)) return CaretUtils.Clean();

		const from = bLeft ? caret.Start.Node : caret.End.Node;
		const fromElement = FormatUtils.GetParentIfText(from) as Element;
		const table = DOM.Closest(fromElement, TableSelector);
		const row = DOM.Closest(fromElement, TableRowSelector);
		const cell = DOM.Closest(fromElement, TableCellSelector);
		if (!row || !cell || !table) return CaretUtils.Clean();

		const tableGrid = GetTableGridWithIndex(self, table, cell);
		if (tableGrid.TargetCellRowIndex === -1 || tableGrid.TargetCellIndex === -1) return CaretUtils.Clean();

		const nextEvent = bUp || bDown ? upDownEvent : leftRightEvent;
		const lastArg = (bUp || bDown ? tableGrid : row) as ITableGrid & Element;
		nextEvent(event, line, lastArg, cell);
	};

	return {
		KeyDownEvent,
	};
};

export default InTable;