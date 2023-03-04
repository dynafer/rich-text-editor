import { Arr } from '@dynafer/utils';
import { TableCellSelector, TableRowSelector, TableSelector } from '../../formatter/Format';
import Editor from '../../Editor';
import { PreventEvent } from '../EventSetupUtils';
import FormatUtils from '../../formatter/FormatUtils';
import { IRangeUtils } from '../../editorUtils/caret/RangeUtils';
import { GetTableGridWithIndex, ITableGrid } from '../../dom/tools/table/TableToolsUtils';
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

	const upDownEvent = (event: KeyboardEvent, line: Node, tableGrid: ITableGrid) => {
		const bUp = event.key === EKeyCode.ArrowUp || event.code === EKeyCode.ArrowUp;

		const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;

		const caret = CaretUtils.Get()[0];
		const rect = caret.Range.GetRect();

		if (rect.height !== 0) {
			const firstChild = DOM.Utils.GetFirstChild(Grid[TargetCellRowIndex][TargetCellIndex], true);
			const lastChild = DOM.Utils.GetLastChild(Grid[TargetCellRowIndex][TargetCellIndex], true);

			const newRange = self.Utils.Range(caret.Range.Clone());

			if (firstChild && lastChild) {
				newRange.SetStart(firstChild, 0);
				newRange.SetEnd(lastChild, DOM.Utils.IsText(lastChild) ? (lastChild.textContent?.length ?? 0) : 0);
				CaretUtils.UpdateRanges([newRange.Get()]);
			}

			const finderRect = newRange.GetRect();

			newRange.SetStart(caret.Start.Node, caret.Start.Offset);
			newRange.SetEnd(caret.End.Node, caret.End.Offset);

			const keyName = bUp ? 'top' : 'bottom';
			if (Math.floor(rect[keyName]) !== Math.floor(finderRect[keyName])) return;
		}

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

		const newRange = self.Utils.Range();

		const rows = DOM.SelectAll(TableRowSelector, line);
		const cells = DOM.SelectAll(TableCellSelector, line);

		const targetRowIndex = bLeft ? 0 : rows.length - 1;
		const targetCellIndex = bLeft ? 0 : cells.length - 1;

		if (row !== rows[targetRowIndex] || cell !== cells[targetCellIndex]) {
			if (!bTab) return CaretUtils.Clean();

			PreventEvent(event);
			const nextCellIndex = Arr.Find(cells, cell);
			return findAndUpdate(newRange, cells[nextCellIndex + (bShift ? -1 : 1)], bLeft);
		}

		PreventEvent(event);

		return insertOrMove(newRange, line, bLeft);
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