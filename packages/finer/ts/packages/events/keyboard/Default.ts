import { Str } from '@dynafer/utils';
import Editor from '../../Editor';
import { PreventEvent } from '../EventSetupUtils';

const DefaultEvent = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	if (!Str.IsEmpty(self.DOM.GetHTML(self.GetBody()).replace(/(\\n|\\t|\s|\<br\>)/gi, ''))) return;

	PreventEvent(event);
	self.InitContent();

	const firstLine = DOM.Utils.GetFirstChild(self.GetBody());
	if (!firstLine) return CaretUtils.Clean();

	const newRange = self.Utils.Range();
	newRange.SetStartToEnd(firstLine, 0, 0);
	CaretUtils.UpdateRanges(newRange);
};

export default DefaultEvent;