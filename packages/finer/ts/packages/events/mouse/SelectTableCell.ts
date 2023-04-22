import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import { ENativeEvents } from '../EventSetupUtils';

const SelectTableCell = (editor: Editor, event: MouseEvent | TouchEvent) => {
	const self = editor;
	const DOM = self.DOM;
	let bDragged = false;

	const bTools = !!DOM.Closest(event.composedPath()[0] as Node, {
		attrs: { dataFixed: 'dom-tool' }
	});

	if (bTools) return;

	const selectedCells = DOM.Element.Table.GetSelectedCells(self);
	DOM.Element.Table.ToggleSelectMultipleCells(false, selectedCells);

	const { Table, Row, Cell } = DOM.Element.Table.Find(event.composedPath()[0]);
	if (!Table || !Row || !Cell) return;

	const rows = DOM.Element.Table.GetAllOwnRows(Table);

	const startRowNum = Arr.Find(rows, Row);

	const { Grid, TargetCellIndex } = DOM.Element.Table.GetGridWithIndex(Table, Cell);
	if (TargetCellIndex === -1) return;

	const moveEvent = (e: MouseEvent | TouchEvent) => {
		const currentCell = DOM.Element.Table.FindClosestCell(e.composedPath()[0]);
		const currentRow = currentCell?.parentElement;
		if (!currentCell || !currentRow || currentCell === Cell || !DOM.Element.Table.IsRow(currentRow)) {
			if (!bDragged) return;

			self.Utils.Caret.CleanRanges();
			DOM.Element.Table.ToggleSelectCell(true, Cell);
			return Arr.Each(DOM.Element.Table.GetSelectedCells(self, Table), cell => {
				if (cell === Cell) return;

				DOM.Element.Table.ToggleSelectCell(false, cell);
			});
		}

		self.Utils.Caret.CleanRanges();
		bDragged = true;

		const currentRowNum = Arr.Find(rows, currentRow);
		let currentCellNum = -1;
		Arr.Each(Grid, (tableRow, exit) => {
			if (currentCellNum !== -1) return exit();
			currentCellNum = Arr.Find(tableRow, currentCell);
		});

		if (currentCellNum === -1) return;

		const minRowNum = Math.min(startRowNum, currentRowNum);
		const maxRowNum = Math.max(startRowNum, currentRowNum);
		const minCellNum = Math.min(TargetCellIndex, currentCellNum);
		const maxCellNum = Math.max(TargetCellIndex, currentCellNum);

		for (let rowIndex = 0, rowLength = Grid.length; rowIndex < rowLength; ++rowIndex) {
			const row = Grid[rowIndex];
			const bRowInRange = rowIndex >= minRowNum && rowIndex <= maxRowNum;

			for (let cellIndex = 0, cellLength = row.length; cellIndex < cellLength; ++cellIndex) {
				const cell = row[cellIndex];
				const bCellInRange = bRowInRange && cellIndex >= minCellNum && cellIndex <= maxCellNum;
				DOM.Element.Table.ToggleSelectCell(bCellInRange, cell);
			}
		}
	};

	const boundEvents: [((Window & typeof globalThis) | Element), ENativeEvents, EventListener][] = [];

	const upEvent = () => Arr.WhileShift(boundEvents, boundEvent => DOM.Off(boundEvent[0], boundEvent[1], boundEvent[2]));

	Arr.Push(boundEvents,
		[Table, ENativeEvents.mousemove, moveEvent as EventListener],
		[Table, ENativeEvents.touchmove, moveEvent as EventListener],
		[self.GetWin(), ENativeEvents.mouseup, upEvent],
		[self.GetWin(), ENativeEvents.touchend, upEvent],
		[window, ENativeEvents.mouseup, upEvent],
		[window, ENativeEvents.touchend, upEvent],
	);

	Arr.Each(boundEvents, boundEvent => DOM.On(boundEvent[0], boundEvent[1], boundEvent[2]));
};

export default SelectTableCell;