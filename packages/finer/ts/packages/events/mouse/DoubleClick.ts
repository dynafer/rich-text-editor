import { NodeType } from '@dynafer/dom-control';
import { Str } from '@dynafer/utils';
import Editor from '../../Editor';
import { BlockFormatTags } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';

const DoubleClick = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;

	const blockNode = DOM.Closest(event.target as Element, Str.Join(',', ...BlockFormatTags.Block));
	if (!blockNode) return;

	const caret = self.Utils.Caret.Get()[0];
	if (caret) FormatUtils.CleanDirty(self, caret);
	self.Utils.Caret.Clean();

	const firstChild = DOM.Utils.GetFirstChild(blockNode, true);
	const lastChild = DOM.Utils.GetLastChild(blockNode, true);

	if (!firstChild || !lastChild) return;

	const newRange = self.Utils.Range();
	newRange.SetStart(firstChild, 0);

	const lastOffset = NodeType.IsText(lastChild) ? lastChild.length : 0;
	newRange.SetEnd(lastChild, lastOffset);

	self.Utils.Caret.UpdateRanges(newRange);

	self.Utils.Shared.DispatchCaretChange();
};

export default DoubleClick;