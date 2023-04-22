import { ITableGrid } from '../../dom/elements/Table';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import FormatUtils from '../../formatter/FormatUtils';
import { PreventEvent } from '../EventSetupUtils';
import { EKeyCode } from './KeyboardUtils';
import MoveUtils from './MoveUtils';

const MoveInTable = (editor: Editor, event: KeyboardEvent, caret: ICaretData): boolean => {
	const self = editor;
	const DOM = self.DOM;

	const bTab = event.key === EKeyCode.Tab || event.code === EKeyCode.Tab;
	const bShift = event.shiftKey;

	const bUp = event.key === EKeyCode.ArrowUp || event.code === EKeyCode.ArrowUp;
	const bDown = event.key === EKeyCode.ArrowDown || event.code === EKeyCode.ArrowDown;
	const bLeft = (bShift && bTab) || event.key === EKeyCode.ArrowLeft || event.code === EKeyCode.ArrowLeft;
	const bRight = (!bShift && bTab) || event.key === EKeyCode.ArrowRight || event.code === EKeyCode.ArrowRight;
	const bBackspace = event.key === EKeyCode.Backspace || event.code === EKeyCode.Backspace;
	const bDelete = event.key === EKeyCode.Delete || event.code === EKeyCode.Delete;

	if (!bUp && !bDown && !bLeft && !bRight && (bBackspace || bDelete)) return false;

	const bBackward = bUp || bLeft;

	const moveUtils = MoveUtils(self, event);

	const getLineInCell = (cell: Node, node: Node): Node => {
		let current: Node | null = node;
		while (current) {
			const parent: Node | null = current.parentNode;
			if (!parent || parent === cell || parent === self.GetBody()) return current;

			current = parent;
		}

		return current;
	};

	const isNextLineInCell = (cell: Node): boolean => {
		if (bTab) return false;

		const targetNode = bBackward ? caret.Start.Node : caret.End.Node;
		const targetOffset = bBackward ? caret.Start.Offset : caret.End.Offset;

		const lineBlock = getLineInCell(cell, targetNode);
		const nextLine = bBackward ? lineBlock.previousSibling : lineBlock.nextSibling;

		if (!nextLine) {
			if (bLeft || bRight) return !moveUtils.IsLastOffset(targetNode, targetOffset, bBackward);

			return false;
		}

		if ((bLeft || bRight) && !moveUtils.IsLastOffset(targetNode, targetOffset, bBackward)) return true;

		if (DOM.Element.Figure.Is(nextLine) && !DOM.Element.Table.Is(nextLine))
			moveUtils.UpdateRange(nextLine, bBackward ? 1 : 0);

		return true;
	};

	const moveVerticalInTable = (tableGrid: ITableGrid): boolean => {
		const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;

		const currentCell = Grid[TargetCellRowIndex][TargetCellIndex];

		if (isNextLineInCell(currentCell)) return false;

		PreventEvent(event);

		const siblingRowIndex = TargetCellRowIndex + (bUp ? -1 : 1);
		if (siblingRowIndex < 0 || siblingRowIndex >= Grid.length) {
			const figure = DOM.Element.Figure.FindClosest(currentCell);
			if (!figure) return false;

			moveUtils.UpdateRange(figure, bUp ? 0 : 1);
			return true;
		}

		const targetCell = Grid[siblingRowIndex][TargetCellIndex];
		if (!targetCell) return false;

		moveUtils.UpdateRangeWithDescendants(targetCell, targetCell, bUp);

		return true;
	};

	const moveHorizontalInTable = (tableGrid: ITableGrid): boolean => {
		const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;

		const currentCell = Grid[TargetCellRowIndex][TargetCellIndex];

		if (isNextLineInCell(currentCell)) return false;

		const edgeRowIndex = bLeft ? 0 : Grid.length - 1;
		const edgeCellIndex = bLeft ? 0 : Grid[TargetCellRowIndex].length - 1;

		if (TargetCellRowIndex === edgeRowIndex && TargetCellIndex === edgeCellIndex) {
			PreventEvent(event);
			const figure = DOM.Element.Figure.FindClosest(currentCell);
			if (!figure) return false;

			moveUtils.UpdateRange(figure, bLeft ? 0 : 1);
			return true;
		}

		if (!bTab) return false;

		const moveIndex = bLeft ? -1 : 1;
		let currentRowIndex = TargetCellRowIndex;
		let currentCellIndex = TargetCellIndex;
		while (!!Grid[currentRowIndex]?.[currentCellIndex] && Grid[currentRowIndex]?.[currentCellIndex] === currentCell) {
			currentCellIndex += moveIndex;
			if (currentCellIndex >= 0 && currentCellIndex < Grid[currentRowIndex].length) continue;

			currentRowIndex += moveIndex;
			currentCellIndex = bLeft ? Grid[currentRowIndex].length - 1 : 0;
		}

		const nextCell = Grid[currentRowIndex]?.[currentCellIndex];

		if (!nextCell) {
			const figure = DOM.Element.Figure.FindClosest(currentCell);
			if (!figure) return false;

			moveUtils.UpdateRange(figure, bLeft ? 0 : 1);
			return true;
		}

		moveUtils.UpdateRangeWithDescendants(nextCell, nextCell, bLeft);
		return true;
	};

	if (DOM.Element.Figure.Is(caret.Start.Node)) {
		if ((bBackward && caret.Start.Offset === 0) || (!bBackward && caret.Start.Offset === 1)) {
			moveUtils.UpdateRangeWithFigure(caret.Start.Node, bBackward);
			return true;
		}

		const { FigureElement } = DOM.Element.Figure.Find(caret.Start.Node);
		if (!FigureElement) return true;

		const cells = DOM.Element.Table.GetAllOwnCells(FigureElement);
		moveUtils.UpdateRangeWithDescendants(caret.Start.Node, cells[bBackward ? cells.length - 1 : 0], bBackward);

		return true;
	}

	const from = bLeft ? caret.Start.Node : caret.End.Node;
	const fromElement = FormatUtils.GetParentIfText(from);

	const { Table, Row, Cell } = DOM.Element.Table.Find(fromElement);
	if (!Table || !Row || !Cell) return false;

	const tableGrid = DOM.Element.Table.GetGridWithIndex(Table, Cell);
	if (tableGrid.TargetCellRowIndex === -1 || tableGrid.TargetCellIndex === -1) return false;

	const bVertical = bUp || bDown;

	const move = bVertical ? moveVerticalInTable : moveHorizontalInTable;
	return move(tableGrid);
};

export default MoveInTable;