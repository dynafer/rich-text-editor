import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import { PreventEvent } from '../EventSetupUtils';
import { EKeyCode } from './KeyboardUtils';

const DeleteInTableCells = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const bBackspace = event.key === EKeyCode.Backspace || event.code === EKeyCode.Backspace;
	const bDelete = event.key === EKeyCode.Delete || event.code === EKeyCode.Delete;
	if (!bBackspace && !bDelete) return;

	const cells = DOM.Element.Table.GetSelectedCells(self);
	if (!!CaretUtils.Get() || Arr.IsEmpty(cells)) return;

	PreventEvent(event);

	const caretCell = bBackspace ? cells[cells.length - 1] : cells[0];

	Arr.WhileShift(cells, cell => {
		const children = DOM.GetChildNodes(cell);
		Arr.WhileShift(children, child => DOM.Remove(child, true));

		const paragraph = self.CreateEmptyParagraph();
		DOM.Insert(cell, paragraph);

		DOM.Element.Table.ToggleSelectCell(false, cell);
	});

	const newRange = self.Utils.Range();
	const firstChild = DOM.Utils.GetFirstChild(caretCell, true) as Element;
	newRange.SetStartToEnd(firstChild, 0, 0);
	CaretUtils.UpdateRange(newRange);
	self.Utils.Shared.DispatchCaretChange();
};

export default DeleteInTableCells;