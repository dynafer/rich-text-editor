import { Arr } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { ENativeEvents } from '../EventSetupUtils';

const SelectTableCell = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const rootDOM = self.GetRootDOM();
	let bDragged = false;

	const selected = DOM.Element.Table.GetSelectedCells(self);
	Arr.Each(selected, cell => DOM.RemoveAttr(cell, Options.ATTRIBUTE_SELECTED));

	const { Table, Row, Cell } = DOM.Element.Table.Find(event.composedPath()[0]);
	if (!Table || !Row || !Cell) return;

	const rows = DOM.Element.Table.GetAllOwnRows(Table);

	const startRowNum = Arr.Find(rows, Row);

	const { Grid, TargetCellIndex } = DOM.Element.Table.GetTableGridWithIndex(Table, Cell);
	if (TargetCellIndex === -1) return;

	const mouseMoveEvent = (e: MouseEvent) => {
		const currentCell = DOM.Element.Table.GetClosestCell(e.composedPath()[0]);
		const currentRow = currentCell?.parentElement;
		if (!currentCell || !currentRow || currentCell === Cell || !DOM.Element.Table.IsTableRow(currentRow)) {
			if (!bDragged) return;

			self.Utils.Caret.CleanRanges();
			DOM.SetAttr(Cell, Options.ATTRIBUTE_SELECTED);
			return Arr.Each(DOM.SelectAll({ attrs: [Options.ATTRIBUTE_SELECTED] }, Table), cell => {
				if (cell === Cell) return;

				DOM.RemoveAttr(cell, Options.ATTRIBUTE_SELECTED);
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
				const toggle = bCellInRange ? DOM.SetAttr : DOM.RemoveAttr;
				toggle(cell, Options.ATTRIBUTE_SELECTED);
			}
		}
	};

	const mouseUpEvent = () => {
		bDragged = false;
		DOM.Off(Table, ENativeEvents.mousemove, mouseMoveEvent);
		DOM.Off(DOM.Win, ENativeEvents.mouseup, mouseUpEvent);
		rootDOM.Off(rootDOM.Win, ENativeEvents.mouseup, mouseUpEvent);
	};

	DOM.On(Table, ENativeEvents.mousemove, mouseMoveEvent);
	DOM.On(DOM.Win, ENativeEvents.mouseup, mouseUpEvent);
	rootDOM.On(rootDOM.Win, ENativeEvents.mouseup, mouseUpEvent);
};

export default SelectTableCell;