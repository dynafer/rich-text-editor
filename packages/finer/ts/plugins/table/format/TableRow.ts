import { Arr, Type } from '@dynafer/utils';
import { ITableGrid } from '../../../packages/dom/elements/Table';
import Editor from '../../../packages/Editor';
import { ICaretData } from '../../../packages/editorUtils/caret/CaretUtils';
import { CanDeleteRowColumn } from '../Utils';

interface ITableGridAndRows {
	readonly rows?: HTMLTableRowElement[],
	readonly table?: HTMLTableElement,
	readonly tableGrid?: ITableGrid,
}

const TableRow = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const getRows = (pointer: ICaretData | HTMLTableCellElement[]): HTMLTableRowElement[] | null => {
		if (!Type.IsArray(pointer)) {
			const row = DOM.Element.Table.GetClosestRow<HTMLTableRowElement>(self.Formatter.Utils.GetParentIfText(pointer.Start.Node));
			return !row ? null : [row];
		}

		if (Arr.IsEmpty(pointer)) return null;

		const rows: HTMLTableRowElement[] = [];
		Arr.Each(pointer, cell => {
			const row = DOM.Element.Table.GetClosestRow(cell);
			if (!row || Arr.Contains(rows, row)) return;
			Arr.Push(rows, row);
		});

		return rows;
	};

	const getRowsWithGrid = (pointer: ICaretData | HTMLTableCellElement[]): ITableGridAndRows => {
		const rows: HTMLTableRowElement[] = [];

		if (!Type.IsArray(pointer)) {
			const { Table, Row, Cell } = DOM.Element.Table.Find(self.Formatter.Utils.GetParentIfText(pointer.Start.Node));
			if (!Table || !Row || !Cell) return {};

			const tableGrid = DOM.Element.Table.GetGridWithIndex(Table, Cell);
			if (tableGrid.TargetCellRowIndex === -1 || tableGrid.TargetCellIndex === -1) return {};

			Arr.Push(rows, Row);
			return {
				rows,
				table: Table,
				tableGrid
			};
		}

		if (Arr.IsEmpty(pointer)) return {};

		const table = DOM.Element.Table.GetClosest<HTMLTableElement>(pointer[0]);
		if (!table) return {};

		const tableGrid = DOM.Element.Table.GetGridWithIndex(table, pointer[0]);
		if (tableGrid.TargetCellRowIndex === -1 || tableGrid.TargetCellIndex === -1) return {};

		Arr.Each(pointer, cell => {
			const row = DOM.Element.Table.GetClosestRow(cell);
			if (!row || Arr.Contains(rows, row)) return;
			Arr.Push(rows, row);
		});

		return {
			rows,
			table,
			tableGrid,
		};
	};

	const InsertFromCaret = (bAbove: boolean) => {
		const caret = CaretUtils.Get();
		const { rows, table, tableGrid } = getRowsWithGrid(caret ?? DOM.Element.Table.GetSelectedCells(self));
		if (!rows || Arr.IsEmpty(rows) || !tableGrid || !table || !CanDeleteRowColumn(self, 'row', table)) return;

		const copiedRange = caret?.Range.Clone();

		const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;

		let targetRow = DOM.Element.Table.GetClosestRow(Grid[TargetCellRowIndex][TargetCellIndex]);
		if (!bAbove && !caret) {
			for (let index = TargetCellRowIndex, length = Grid.length; index < length; ++index) {
				const cell = Grid[index][TargetCellIndex] ?? null;
				const row = DOM.Element.Table.GetClosestRow(cell);
				if (!row || !Arr.Contains(rows, row) || index === length - 1) {
					targetRow = row;
					break;
				}
			}
		}

		const insert = bAbove ? DOM.InsertBefore : DOM.InsertAfter;

		const newRow = DOM.Create(DOM.Element.Table.RowSelector);
		for (let index = 0, length = Grid[0].length; index < length; ++index) {
			const newColumn = DOM.Create('td', {
				children: [self.CreateEmptyParagraph()]
			});

			DOM.Insert(newRow, newColumn);
		}

		insert(targetRow, newRow);

		if (caret && copiedRange) CaretUtils.UpdateRange(copiedRange);
		self.Utils.Shared.DispatchCaretChange();
	};

	const SelectFromCaret = () => {
		const rows = getRows(CaretUtils.Get() ?? DOM.Element.Table.GetSelectedCells(self));
		if (!rows || Arr.IsEmpty(rows)) return;

		Arr.WhileShift(rows, row => DOM.Element.Table.ToggleSelectMultipleCells(true, DOM.Element.Table.GetAllOwnCells(row)));

		CaretUtils.CleanRanges();
		self.Utils.Shared.DispatchCaretChange();
	};

	const DeleteFromCaret = () => {
		const { rows, table, tableGrid } = getRowsWithGrid(CaretUtils.Get() ?? DOM.Element.Table.GetSelectedCells(self));
		if (!rows || Arr.IsEmpty(rows) || !tableGrid || !table || !CanDeleteRowColumn(self, 'row', table)) return;

		const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;

		let futureCaretTarget: Node | null = null;
		for (let index = TargetCellRowIndex, length = Grid.length; index < length; ++index) {
			const cell = Grid[index][TargetCellIndex] ?? null;
			const row = DOM.Element.Table.GetClosestRow(cell);
			if (!row || !Arr.Contains(rows, row)) {
				futureCaretTarget = cell;
				break;
			}
		}

		futureCaretTarget = futureCaretTarget ?? Grid[TargetCellRowIndex - 1][TargetCellIndex] ?? null;

		Arr.WhileShift(rows, row => DOM.Remove(row, true));

		futureCaretTarget = futureCaretTarget ?? DOM.Element.Table.GetAllOwnCells(table)[0] ?? null;
		const firstChild = DOM.Utils.GetFirstChild(futureCaretTarget, true);
		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(firstChild, 0, 0);
		CaretUtils.UpdateRange(newRange);
		self.Utils.Shared.DispatchCaretChange();
	};

	return {
		InsertFromCaret,
		SelectFromCaret,
		DeleteFromCaret,
	};
};

export default TableRow;