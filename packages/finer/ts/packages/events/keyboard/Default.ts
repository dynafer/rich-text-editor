import { Str } from '@dynafer/utils';
import Editor from '../../Editor';

const DefaultEvent = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;

	if (Str.IsEmpty(self.DOM.GetHTML(self.GetBody()).replace(/(\\n|\\t|\s|\<br\>)/gi, ''))) {
		event.preventDefault();
		event.stopPropagation();
		self.InitContent();

		const newCaret = new Range();
		const initialChild = self.GetBody().firstChild as Node;
		newCaret.setStart(initialChild, 0);
		newCaret.setEnd(initialChild, 0);
		self.Utils.Caret.UpdateRanges([newCaret]);
	}
};

export default DefaultEvent;