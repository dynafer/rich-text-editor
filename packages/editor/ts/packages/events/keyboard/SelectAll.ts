import { NodeType } from '@dynafer/dom-control';
import DOM from '../../dom/DOM';
import Editor from '../../Editor';
import { PreventEvent } from '../EventSetupUtils';

const SelectAll = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;

	PreventEvent(event);

	const lines = self.GetLines();
	const firstChild = DOM.Utils.GetFirstChild(lines[0], true);
	const lastChild = DOM.Utils.GetLastChild(lines[lines.length - 1], true);

	if (!firstChild || !lastChild) return;

	const newRange = self.Utils.Range();
	newRange.SetStart(firstChild, 0);
	newRange.SetEnd(lastChild, NodeType.IsText(lastChild) ? lastChild.length : 0);

	self.Utils.Caret.UpdateRange(newRange);
	self.Utils.Shared.DispatchCaretChange();
	self.Focus();
};

export default SelectAll;