import { Arr, Type } from '@dynafer/utils';
import Options from '../../../../Options';
import Editor from '../../../Editor';
import { ICaretData } from '../../../editorUtils/caret/CaretUtils';
import { TableCellSelector, TableCellSet, TableRowSelector } from '../../../formatter/Format';

export const MOVABLE_ADDABLE_SIZE = 16;
export const ADJUSTABLE_EDGE_ADDABLE_SIZE = -6;
export const ADJUSTABLE_LINE_HALF_SIZE = 3;
export const ADJUSTABLE_LINE_ADDABLE_SIZE = -2;

type TCurrentPoint = ICaretData | HTMLElement[] | undefined;

export interface ITableGrid {
	Grid: HTMLElement[][],
	TargetCellRowIndex: number,
	TargetCellIndex: number,
}

export const CreateMovableHorizontalSize = <T extends boolean = false>(size: number, bWithPixel: T | false = false): T extends false ? number : string =>
	(bWithPixel
		? `${size + MOVABLE_ADDABLE_SIZE}px`
		: size + MOVABLE_ADDABLE_SIZE
	) as T extends false ? number : string;

export const CreateAdjustableEdgeSize = <T extends boolean = false>(size: number, bWithPixel: T | false = false): T extends false ? number : string =>
	(bWithPixel
		? `${size + ADJUSTABLE_EDGE_ADDABLE_SIZE}px`
		: size + ADJUSTABLE_EDGE_ADDABLE_SIZE
	) as T extends false ? number : string;

export const CreateAdjustableLineSize = <T extends boolean = false>(size: number, bWithPixel: T | false = false): T extends false ? number : string =>
	(bWithPixel
		? `${size + ADJUSTABLE_LINE_ADDABLE_SIZE}px`
		: size + ADJUSTABLE_LINE_ADDABLE_SIZE
	) as T extends false ? number : string;

export const CreateCurrentPoint = (editor: Editor, table: HTMLElement): TCurrentPoint => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	let point: TCurrentPoint = CaretUtils.Get()[0];
	CaretUtils.CleanRanges();

	if (!point) point = DOM.SelectAll({ tagName: [...TableCellSet], attrs: [Options.ATTRIBUTE_SELECTED] }, table);

	return point;
};

export const MoveToCurrentPoint = (editor: Editor, table: HTMLElement, point: TCurrentPoint) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const selected = DOM.SelectAll({ tagName: [...TableCellSet], attrs: [Options.ATTRIBUTE_SELECTED] }, table);
	Arr.Each(selected, cell => DOM.RemoveAttr(cell, Options.ATTRIBUTE_SELECTED));

	if (!point) {
		const firstCell = DOM.SelectAll(TableCellSelector, table)[0];
		if (!firstCell) return;

		let firstChild: Node | null = DOM.Utils.GetFirstChild(firstCell, true);
		if (DOM.Utils.IsBr(firstChild)) firstChild = firstChild.parentNode;

		if (!firstChild) return;

		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(firstChild, 0, 0);
		return CaretUtils.UpdateRanges([newRange.Get()]);
	}

	if (Type.IsArray(point)) {
		Arr.Each(point, cell => DOM.SetAttr(cell, Options.ATTRIBUTE_SELECTED, ''));
		point = undefined;
		return;
	}

	const newRange = self.Utils.Range();
	newRange.SetStart(point.Start.Node, point.Start.Offset);
	newRange.SetEnd(point.End.Node, point.End.Offset);
	CaretUtils.UpdateRanges([newRange.Get()]);
	CaretUtils.Clean();
};

export const GetTableGridWithIndex = (editor: Editor, table: Element, targetCell?: Element): ITableGrid => {
	const self = editor;
	const DOM = self.DOM;

	const Grid: HTMLElement[][] = [];
	const rowspans: [number, number, number][] = [];

	const rows = DOM.SelectAll(TableRowSelector, table);

	let TargetCellRowIndex = -1;
	let TargetCellIndex = -1;

	for (let rowIndex = 0, rowLength = rows.length; rowIndex < rowLength; ++rowIndex) {
		const row = rows[rowIndex];
		const cellsInRow = DOM.GetChildren(row);

		const cells: Element[] = [];
		for (let cellIndex = 0, cellLength = cellsInRow.length; cellIndex < cellLength; ++cellIndex) {
			const cell = cellsInRow[cellIndex];
			const colspan = parseInt(DOM.GetAttr(cell, 'colspan') ?? '0');
			const rowspan = parseInt(DOM.GetAttr(cell, 'rowspan') ?? '0');

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
				const rowspanTarget = DOM.GetChildren(rows[rowspanIndex[0] - 1])[rowspanIndex[2]];
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

export const CreateFakeTable = (editor: Editor, table: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;

	const fakeTable = DOM.Clone(table, true) as HTMLElement;
	DOM.SetAttr(fakeTable, 'contenteditable', 'false');
	DOM.SetStyles(fakeTable, {
		margin: '0',
		position: 'absolute',
		left: `${table.offsetLeft}px`,
		top: `${table.offsetTop}px`,
	});

	return fakeTable;
};

export const GetClientSize = (editor: Editor, target: HTMLElement, type: 'width' | 'height'): number => editor.DOM.GetRect(target)?.[type] ?? 0;