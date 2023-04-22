import { NodeType } from '@dynafer/dom-control';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import FormatUI from '../formatter/FormatUI';

const SelectAll = (editor: Editor) => {
	const self = editor;

	const Name = 'SelectAll';
	const title = self.Lang('toolbar.select.all', 'Select all');

	const Create = (): HTMLElement => {
		const button = FormatUI.CreateIconButton(title, Name);

		self.AddShortcut(title, 'Ctrl+A');

		FormatUI.BindClickEvent(button, () => {
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
		});

		return button;
	};

	return {
		Name,
		Create,
	};
};

export default SelectAll;