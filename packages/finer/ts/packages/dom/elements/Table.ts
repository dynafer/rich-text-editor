import { Attribute, NodeType } from '@dynafer/dom-control';
import { Arr, Str } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import DOMUtils from '../DOMUtils';

interface IFoundTable {
	readonly Table: HTMLTableElement | null,
	readonly Row: HTMLTableRowElement | null,
	readonly Cell: HTMLTableCellElement | null,
}

export interface ITableGrid {
	readonly Grid: HTMLElement[][],
	readonly TargetCellRowIndex: number,
	readonly TargetCellIndex: number,
}

export interface ITable {
	readonly Selector: string,
	readonly RowSelector: string,
	readonly CellSet: Set<string>,
	readonly CellSelector: string,
	Find: (from: EventTarget | Node) => IFoundTable,
	GetAllOwnRows: (table: Element) => HTMLTableRowElement[],
	GetAllOwnCells: (table: Element, row?: Element) => HTMLTableCellElement[],
	GetSelectedCells: (editor: Editor, table?: Element, bSelected?: boolean) => HTMLTableCellElement[],
	ToggleSelectCell: (bSelected: boolean, cell: Element) => void,
	ToggleSelectMultipleCells: (bSelected: boolean, cells: Element[]) => void,
	GetGridWithIndex: (table: Element, targetCell?: Element) => ITableGrid,
	IsTable: <T extends Node>(selector?: T | EventTarget | null) => boolean,
	IsTableRow: <T extends Node>(selector?: T | EventTarget | null) => boolean,
	IsTableCell: <T extends Node>(selector?: T | EventTarget | null) => boolean,
	GetClosest: <T extends Node>(selector?: T | EventTarget | null) => HTMLTableElement | T | null,
	GetClosestRow: <T extends Node>(selector?: T | EventTarget | null) => HTMLTableRowElement | T | null,
	GetClosestCell: <T extends Node>(selector?: T | EventTarget | null) => HTMLTableCellElement | T | null,
}

const Table = (): ITable => {
	const Selector = 'table';
	const RowSelector = 'tr';
	const CellSet = new Set(['th', 'td']);
	const CellSelector = Str.Join(',', ...CellSet);

	const Find = (from: EventTarget | Node): IFoundTable => {
		const bElement = NodeType.IsElement(from);
		const table = bElement ? from.closest(Selector) : null;
		const row = bElement ? from.closest(RowSelector) : null;
		const cell = bElement ? from.closest<HTMLTableCellElement>(CellSelector) : null;

		return {
			Table: table,
			Row: row,
			Cell: cell,
		};
	};

	const GetAllOwnRows = (table: Element): HTMLTableRowElement[] => {
		const allRows = Arr.Convert(table.querySelectorAll(RowSelector));
		const rows: HTMLTableRowElement[] = [];

		Arr.WhileShift(allRows, row => {
			if (!row || row.closest(Selector) !== table) return;
			Arr.Push(rows, row);
		});

		return rows;
	};

	const GetAllOwnCells = (table: Element, row?: Element): HTMLTableCellElement[] => {
		const parent = row ?? table;
		const selector = !!row ? RowSelector : Selector;

		const allCells = Arr.Convert(parent.querySelectorAll<HTMLTableCellElement>(CellSelector));
		const cells: HTMLTableCellElement[] = [];

		Arr.WhileShift(allCells, cell => {
			if (!cell || cell.closest(selector) !== parent) return;
			Arr.Push(cells, cell);
		});

		return cells;
	};

	const GetSelectedCells = (editor: Editor, table?: Element, bSelected: boolean = true): HTMLTableCellElement[] =>
		editor.DOM.SelectAll<HTMLTableCellElement>({
			tagName: [...CellSet],
			attrs: [Options.ATTRIBUTE_SELECTED],
			bNot: !bSelected,
		}, table ?? editor.GetBody());

	const ToggleSelectCell = (bSelected: boolean, cell: Element) =>
		bSelected ? cell.setAttribute(Options.ATTRIBUTE_SELECTED, '') : cell.removeAttribute(Options.ATTRIBUTE_SELECTED);

	const ToggleSelectMultipleCells = (bSelected: boolean, cells: Element[]) =>
		Arr.Each(cells, cell => ToggleSelectCell(bSelected, cell));

	const GetGridWithIndex = (table: Element, targetCell?: Element): ITableGrid => {
		const Grid: HTMLTableCellElement[][] = [];
		const rowspans: [number, number, number][] = [];

		const rows = GetAllOwnRows(table);

		let TargetCellRowIndex = -1;
		let TargetCellIndex = -1;

		for (let rowIndex = 0, rowLength = rows.length; rowIndex < rowLength; ++rowIndex) {
			const row = rows[rowIndex];
			const cellsInRow = GetAllOwnCells(table, row);

			const cells: Element[] = [];
			for (let cellIndex = 0, cellLength = cellsInRow.length; cellIndex < cellLength; ++cellIndex) {
				const cell = cellsInRow[cellIndex];
				const colspan = parseInt(Attribute.Get(cell, 'colspan') ?? '0');
				const rowspan = parseInt(Attribute.Get(cell, 'rowspan') ?? '0');

				if (!colspan || colspan <= 1) {
					Arr.Push(cells, cell);
				} else {
					for (let index = 0; index < colspan; ++index) {
						Arr.Push(cells, cell);
					}
				}

				if (rowspan > 1) Arr.Push(rowspans, [rowIndex + 1, rowIndex + rowspan - 1, cellIndex]);

				if (Arr.IsEmpty(rowspans)) continue;

				Arr.Each(rowspans, rowspanIndex => {
					if (rowIndex < rowspanIndex[0] || rowIndex > rowspanIndex[1] || cellIndex !== rowspanIndex[2]) return;
					const rowspanTarget = GetAllOwnCells(table, rows[rowspanIndex[0] - 1])[rowspanIndex[2]];
					if (!rowspanTarget) return;
					Arr.Unshift(cells, rowspanTarget);
				});
			}

			if (targetCell && TargetCellIndex === -1) {
				TargetCellRowIndex = rowIndex;
				TargetCellIndex = Arr.Find(cells, targetCell);
			}

			Arr.Push(Grid, cells);
		}

		return {
			Grid,
			TargetCellRowIndex,
			TargetCellIndex,
		};
	};

	const IsTable = <T extends Node>(selector?: T | EventTarget | null): boolean =>
		!NodeType.IsNode(selector) ? false : DOMUtils.GetNodeName(selector) === Selector;

	const IsTableRow = <T extends Node>(selector?: T | EventTarget | null): boolean =>
		!NodeType.IsNode(selector) ? false : DOMUtils.GetNodeName(selector) === RowSelector;

	const IsTableCell = <T extends Node>(selector?: T | EventTarget | null): boolean =>
		!NodeType.IsNode(selector) ? false : DOMUtils.GetNodeName(selector) === CellSelector;

	const GetClosest = <T extends Node>(selector?: T | EventTarget | null): HTMLTableElement | T | null =>
		!NodeType.IsElement(selector) ? null : selector.closest(Selector);

	const GetClosestRow = <T extends Node>(selector?: T | EventTarget | null): HTMLTableRowElement | T | null =>
		!NodeType.IsElement(selector) ? null : selector.closest(RowSelector);

	const GetClosestCell = <T extends Node>(selector?: T | EventTarget | null): HTMLTableCellElement | T | null =>
		!NodeType.IsElement(selector) ? null : selector.closest<HTMLTableCellElement>(CellSelector);

	return {
		Selector,
		RowSelector,
		CellSet,
		CellSelector,
		Find,
		GetAllOwnRows,
		GetAllOwnCells,
		GetSelectedCells,
		ToggleSelectCell,
		ToggleSelectMultipleCells,
		GetGridWithIndex,
		IsTable,
		IsTableRow,
		IsTableCell,
		GetClosest,
		GetClosestRow,
		GetClosestCell,
	};
};

export default Table();