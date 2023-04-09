import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import { ENativeEvents } from '../EventSetupUtils';

const SelectTableCell = (editor: Editor, event: MouseEvent | TouchEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const rootDOM = self.GetRootDOM();
	let bDragged = false;

	const selectedCells = DOM.Element.Table.GetSelectedCells(self);
	DOM.Element.Table.ToggleSelectMultipleCells(false, selectedCells);

	const { Table, Row, Cell } = DOM.Element.Table.Find(event.composedPath()[0]);
	if (!Table || !Row || !Cell) return;

	const rows = DOM.Element.Table.GetAllOwnRows(Table);

	const startRowNum = Arr.Find(rows, Row);

	const { Grid, TargetCellIndex } = DOM.Element.Table.GetGridWithIndex(Table, Cell);
	if (TargetCellIndex === -1) return;

	const moveEvent = (e: MouseEvent | TouchEvent) => {
		const currentCell = DOM.Element.Table.GetClosestCell(e.composedPath()[0]);
		const currentRow = currentCell?.parentElement;
		if (!currentCell || !currentRow || currentCell === Cell || !DOM.Element.Table.IsTableRow(currentRow)) {
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

	const upEvent = () => {
		bDragged = false;
		DOM.Off(Table, ENativeEvents.mousemove, moveEvent);
		DOM.Off(Table, ENativeEvents.touchmove, moveEvent);
		DOM.Off(DOM.Win, ENativeEvents.mouseup, upEvent);
		DOM.Off(DOM.Win, ENativeEvents.touchend, upEvent);
		rootDOM.Off(rootDOM.Win, ENativeEvents.mouseup, upEvent);
		rootDOM.Off(rootDOM.Win, ENativeEvents.touchend, upEvent);
	};

	DOM.On(Table, ENativeEvents.mousemove, moveEvent);
	DOM.On(Table, ENativeEvents.touchmove, moveEvent);
	DOM.On(DOM.Win, ENativeEvents.mouseup, upEvent);
	DOM.On(DOM.Win, ENativeEvents.touchend, upEvent);
	rootDOM.On(rootDOM.Win, ENativeEvents.mouseup, upEvent);
	rootDOM.On(rootDOM.Win, ENativeEvents.touchend, upEvent);
};

export default SelectTableCell;