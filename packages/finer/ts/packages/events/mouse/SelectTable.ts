import { Arr } from '@dynafer/utils';
import Options from '../../../Options';
import { TableCellSelector, TableRowSelector, TableSelector } from '../../formatter/Format';
import Editor from '../../Editor';

const SelectTable = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;
	let bDragged = false;

	for (const selected of DOM.SelectAll({ attrs: [Options.ATTRIBUTE_SELECTED] })) {
		DOM.RemoveAttr(selected, Options.ATTRIBUTE_SELECTED);
	}

	const targetCell = DOM.Closest(event.composedPath()[0] as Element, TableCellSelector);
	const targetRow = targetCell?.parentElement;
	const targetTable = DOM.Closest(targetCell, TableSelector);
	if (!targetCell || !targetRow || !targetTable || DOM.Utils.GetNodeName(targetRow) !== TableRowSelector) return;

	const rows = DOM.SelectAll(TableRowSelector, targetTable);

	const startRowNum = Arr.Find(rows, targetRow);
	const startCellNum = Arr.Find(DOM.GetChildren(targetRow), targetCell);

	const mouseMoveEvent = (e: MouseEvent) => {
		const currentCell = DOM.Closest(e.composedPath()[0] as Element, TableCellSelector);
		const currentRow = currentCell?.parentElement;
		if (!currentCell || !currentRow || currentCell === targetCell || DOM.Utils.GetNodeName(currentRow) !== TableRowSelector) {
			if (!bDragged) return;

			self.Utils.Caret.CleanRanges();
			DOM.SetAttr(targetCell, Options.ATTRIBUTE_SELECTED, '');
			for (const selected of DOM.SelectAll({ attrs: [Options.ATTRIBUTE_SELECTED] }, targetTable)) {
				if (selected === targetCell) {
					continue;
				}

				DOM.RemoveAttr(selected, Options.ATTRIBUTE_SELECTED);
			}
			return;
		}

		self.Utils.Caret.CleanRanges();
		bDragged = true;

		const currentRowNum = Arr.Find(rows, currentRow);
		const currentCellNum = Arr.Find(DOM.GetChildren(currentRow), currentCell);

		const minRowNum = Math.min(startRowNum, currentRowNum);
		const maxRowNum = Math.max(startRowNum, currentRowNum);
		const minCellNum = Math.min(startCellNum, currentCellNum);
		const maxCellNum = Math.max(startCellNum, currentCellNum);

		for (let rowIndex = 0, rowLength = rows.length; rowIndex < rowLength; ++rowIndex) {
			const row = rows[rowIndex];
			const cellsInRange = DOM.GetChildren(row);
			const bRowInRange = rowIndex >= minRowNum && rowIndex <= maxRowNum;

			for (let cellIndex = 0, cellLength = cellsInRange.length; cellIndex < cellLength; ++cellIndex) {
				const cellInRange = cellsInRange[cellIndex];
				if (bRowInRange && cellIndex >= minCellNum && cellIndex <= maxCellNum) {
					DOM.SetAttr(cellInRange, Options.ATTRIBUTE_SELECTED, '');
					continue;
				}

				DOM.RemoveAttr(cellInRange, Options.ATTRIBUTE_SELECTED);
			}
		}
	};

	const mouseUpEvent = () => {
		bDragged = false;
		DOM.Off(targetTable, 'mousemove', mouseMoveEvent);
		DOM.Off(DOM.GetRoot(), 'mouseup', mouseUpEvent);
	};

	DOM.On(targetTable, 'mousemove', mouseMoveEvent);
	DOM.On(DOM.GetRoot(), 'mouseup', mouseUpEvent);
};

export default SelectTable;