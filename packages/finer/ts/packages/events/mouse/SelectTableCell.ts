import { Arr } from '@dynafer/utils';
import Options from '../../../Options';
import { GetTableGridWithIndex } from '../../dom/tools/table/TableToolsUtils';
import Editor from '../../Editor';
import { TableCellSelector, TableCellSet, TableRowSelector, TableSelector } from '../../formatter/Format';
import { ENativeEvents } from '../EventSetupUtils';

const SelectTableCell = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;
	let bDragged = false;

	const selected = DOM.SelectAll({ tagName: [...TableCellSet], attrs: [Options.ATTRIBUTE_SELECTED] });
	Arr.Each(selected, cell => DOM.RemoveAttr(cell, Options.ATTRIBUTE_SELECTED));

	const targetCell = DOM.Closest(event.composedPath()[0] as Element, TableCellSelector);
	const targetRow = targetCell?.parentElement;
	const targetTable = DOM.Closest(targetCell, TableSelector);
	if (!targetCell || !targetRow || !targetTable || DOM.Utils.GetNodeName(targetRow) !== TableRowSelector) return;

	const rows = DOM.SelectAll(TableRowSelector, targetTable);

	const startRowNum = Arr.Find(rows, targetRow);

	const { Grid, TargetCellIndex } = GetTableGridWithIndex(self, targetTable, targetCell);

	if (TargetCellIndex === -1) return;

	const mouseMoveEvent = (e: MouseEvent) => {
		const currentCell = DOM.Closest(e.composedPath()[0] as Element, TableCellSelector);
		const currentRow = currentCell?.parentElement;
		if (!currentCell || !currentRow || currentCell === targetCell || DOM.Utils.GetNodeName(currentRow) !== TableRowSelector) {
			if (!bDragged) return;

			self.Utils.Caret.CleanRanges();
			DOM.SetAttr(targetCell, Options.ATTRIBUTE_SELECTED, '');
			Arr.Each(DOM.SelectAll({ attrs: [Options.ATTRIBUTE_SELECTED] }, targetTable), cell => {
				if (cell === targetCell) return;

				DOM.RemoveAttr(cell, Options.ATTRIBUTE_SELECTED);
			});
			return;
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
				toggle(cell, Options.ATTRIBUTE_SELECTED, '');
			}
		}
	};

	const mouseUpEvent = () => {
		bDragged = false;
		DOM.Off(targetTable, ENativeEvents.mousemove, mouseMoveEvent);
		DOM.Off(DOM.GetRoot(), ENativeEvents.mouseup, mouseUpEvent);
	};

	DOM.On(targetTable, ENativeEvents.mousemove, mouseMoveEvent);
	DOM.On(DOM.GetRoot(), ENativeEvents.mouseup, mouseUpEvent);
};

export default SelectTableCell;