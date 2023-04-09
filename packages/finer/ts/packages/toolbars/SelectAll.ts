import { NodeType } from '@dynafer/dom-control';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { ENativeEvents } from '../events/EventSetupUtils';

const SelectAll = (editor: Editor) => {
	const self = editor;

	const title = Finer.ILC.Get('toolbar.select.all') ?? 'Select all';

	const Create = () => {
		const button = DOM.Create('button', {
			attrs: { title },
			class: DOM.Utils.CreateUEID('icon-button', false),
			html: Finer.Icons.Get('SelectAll')
		});

		self.AddShortcut(title, 'Ctrl+A');

		DOM.On(button, ENativeEvents.click, () => {
			const lines = self.GetLines();
			const firstChild = DOM.Utils.GetFirstChild(lines[0], true);
			const lastChild = DOM.Utils.GetLastChild(lines[lines.length - 1], true);

			if (firstChild && lastChild) {
				const newRange = self.Utils.Range();
				newRange.SetStart(firstChild, 0);
				newRange.SetEnd(lastChild, NodeType.IsText(lastChild) ? lastChild.length : 0);

				self.Utils.Caret.UpdateRange(newRange);
				self.Utils.Shared.DispatchCaretChange();
				self.Focus();
			}
		});

		return button;
	};

	return {
		Name: 'SelectAll',
		Create,
	};
};

export default SelectAll;