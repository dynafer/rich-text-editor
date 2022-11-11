import { Str } from '@dynafer/utils';
import Editor from '../../Editor';

const DefaultEvent = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;

	if (Str.IsEmpty(self.DOM.GetHTML(self.GetBody()).replace(/(\\n|\\t|\s|\<br\>)/gi, ''))) {
		event.preventDefault();
		event.stopPropagation();
		self.InitContent();

		const newCaret = self.Utils.Range();
		newCaret.SetStartToEnd(self.GetBody().firstChild as Node, 0, 0);
		self.Utils.Caret.UpdateRanges([newCaret.Get()]);
	}
};

export default DefaultEvent;