import { Arr, Type } from '@dynafer/utils';
import { ITableGrid } from '../../../packages/dom/elements/Table';
import Editor from '../../../packages/Editor';
import { ICaretData } from '../../../packages/editorUtils/caret/CaretUtils';
import { CanDeleteRowColumn } from '../Utils';

interface ITableGridAndColumns {
	readonly columns?: HTMLTableCellElement[],
	readonly table?: HTMLTableElement,
	readonly tableGrid?: ITableGrid,
}

const TableColumn = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const getColumnsWithGrid = (pointer: ICaretData | HTMLTableCellElement[]): ITableGridAndColumns => {
		const columns: HTMLTableCellElement[] = [];

		if (!Type.IsArray(pointer)) {
			const { Table, Cell } = DOM.Element.Table.Find(self.Formatter.Utils.GetParentIfText(pointer.Start.Node));
			if (!Table || !Cell) return {};

			const tableGrid = DOM.Element.Table.GetGridWithIndex(Table, Cell);
			const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;
			if (TargetCellRowIndex === -1 || TargetCellIndex === -1) return {};

			Arr.Each(Grid, row => {
				if (!row[TargetCellIndex]) return;
				Arr.Push(columns, row[TargetCellIndex]);
			});

			return {
				columns,
				table: Table,
				tableGrid,
			};
		}

		if (Arr.IsEmpty(pointer)) return {};

		const table = DOM.Element.Table.GetClosest<HTMLTableElement>(pointer[0]);
		if (!table) return {};

		const tableGrid = DOM.Element.Table.GetGridWithIndex(table, pointer[0]);
		const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;
		if (TargetCellRowIndex === -1 || TargetCellIndex === -1 || !Grid[TargetCellRowIndex]) return {};

		const columnIndexes: number[] = [TargetCellIndex];

		for (let index = TargetCellIndex + 1, length = Grid[TargetCellRowIndex].length; index < length; ++index) {
			if (!Arr.Contains(pointer, Grid[TargetCellRowIndex][index])) break;
			Arr.Push(columnIndexes, index);
		}

		Arr.Each(Grid, row =>
			Arr.Each(columnIndexes, columnIndex => {
				if (!row[columnIndex]) return;
				Arr.Push(columns, row[columnIndex]);
			})
		);

		Arr.Clean(columnIndexes);

		return {
			columns,
			table,
			tableGrid,
		};
	};

	const InsertFromCaret = (bLeft: boolean) => {
		const caret = CaretUtils.Get();
		const { columns, table, tableGrid } = getColumnsWithGrid(caret ?? DOM.Element.Table.GetSelectedCells(self));
		if (!columns || Arr.IsEmpty(columns) || !tableGrid || !table || !CanDeleteRowColumn(self, 'column', table)) return;

		const copiedRange = caret?.Range.Clone();

		const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;

		let columnIndex = TargetCellIndex;
		if (!bLeft && !caret) {
			for (let index = TargetCellIndex, length = Grid[TargetCellRowIndex].length; index < length; ++index) {
				const nextColumn = Grid[TargetCellRowIndex][index].nextElementSibling;
				if (!nextColumn || !Arr.Contains(columns, nextColumn)) {
					columnIndex = index;
					break;
				}
			}
		}

		const addedColumns: HTMLTableCellElement[] = [];
		Arr.Each(Grid, row => {
			const column = row[columnIndex];
			if (!column) return;

			const sibling = bLeft ? column.previousElementSibling : column.nextElementSibling;
			if (Arr.Contains(addedColumns, sibling)) return;

			const newColumn = DOM.Create('td', {
				children: [self.CreateEmptyParagraph()]
			});

			const insert = bLeft ? DOM.InsertBefore : DOM.InsertAfter;
			insert(column, newColumn);

			Arr.Push(addedColumns, newColumn);
		});

		Arr.Clean(addedColumns);

		if (caret && copiedRange) CaretUtils.UpdateRange(copiedRange);
		self.Utils.Shared.DispatchCaretChange();
	};

	const SelectFromCaret = () => {
		const { columns } = getColumnsWithGrid(CaretUtils.Get() ?? DOM.Element.Table.GetSelectedCells(self));
		if (!columns || Arr.IsEmpty(columns)) return;

		DOM.Element.Table.ToggleSelectMultipleCells(true, columns);
		Arr.Clean(columns);

		CaretUtils.CleanRanges();
		self.Utils.Shared.DispatchCaretChange();
	};

	const DeleteFromCaret = () => {
		const { columns, table, tableGrid } = getColumnsWithGrid(CaretUtils.Get() ?? DOM.Element.Table.GetSelectedCells(self));
		if (!columns || Arr.IsEmpty(columns) || !tableGrid || !table || !CanDeleteRowColumn(self, 'column', table)) return;

		const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;

		let futureCaretTarget: Node | null = null;
		for (let index = TargetCellIndex, length = Grid[TargetCellRowIndex].length; index < length; ++index) {
			const nextColumn = Grid[TargetCellRowIndex][index].nextElementSibling;
			if (!nextColumn || !Arr.Contains(columns, nextColumn)) {
				futureCaretTarget = nextColumn;
				break;
			}
		}

		futureCaretTarget = futureCaretTarget ?? Grid[TargetCellRowIndex][TargetCellIndex].previousElementSibling;

		Arr.WhileShift(columns, column => DOM.Remove(column, true));

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

export default TableColumn;