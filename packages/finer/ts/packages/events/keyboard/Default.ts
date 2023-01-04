import { Str } from '@dynafer/utils';
import Editor from '../../Editor';
import { PreventEvent } from '../EventSetupUtils';

const DefaultEvent = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;
	const CaretUtils = self.Utils.Caret;

	if (!Str.IsEmpty(self.DOM.GetHTML(self.GetBody()).replace(/(\\n|\\t|\s|\<br\>)/gi, ''))) return;

	PreventEvent(event);
	self.InitContent();

	const newCaret = self.Utils.Range();
	newCaret.SetStartToEnd(self.GetBody().firstChild as Node, 0, 0);
	CaretUtils.UpdateRanges([newCaret.Get()]);
	return CaretUtils.Clean();
};

export default DefaultEvent;