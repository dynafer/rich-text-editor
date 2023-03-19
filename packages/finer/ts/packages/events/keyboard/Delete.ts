import { Str } from '@dynafer/utils';
import Editor from '../../Editor';
import { BlockFormatTags, FigureSelector, ListItemSelector } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';
import { PreventEvent } from '../EventSetupUtils';
import { EKeyCode } from './KeyboardUtils';

const Delete = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const bBackward = event.key === EKeyCode.Backspace || event.code === EKeyCode.Backspace;

	const caret = CaretUtils.Get()[0];
	if (!caret || caret.IsRange()) return CaretUtils.Clean();

	if (DOM.Utils.GetNodeName(caret.Start.Node) === FigureSelector) {
		PreventEvent(event);
		DOM.Remove(caret.Start.Node as Element, true);
		return CaretUtils.Clean();
	}

	const blockNode = DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node), Str.Join(',', ...BlockFormatTags.Block));
	if (!blockNode) return CaretUtils.Clean();

	FormatUtils.CleanDirty(self, caret);

	const getChild = bBackward ? DOM.Utils.GetFirstChild : DOM.Utils.GetLastChild;
	const targetChild = getChild(blockNode, true);

	const textLength = DOM.Utils.IsText(caret.Start.Node) ? caret.Start.Node.length : DOM.GetText(caret.Start.Node as HTMLElement).length;

	if (
		!targetChild
		|| (!DOM.Utils.IsChildOf(caret.Start.Node, targetChild) && !DOM.Utils.IsChildOf(targetChild, caret.Start.Node))
		|| (bBackward && caret.Start.Offset !== 0)
		|| (!bBackward && textLength > caret.Start.Offset)
	) return CaretUtils.Clean();

	const lines = DOM.GetChildren(self.GetBody());

	const listItem = DOM.Closest(blockNode, ListItemSelector);

	let checker: Element;
	if (!listItem) {
		const blockSibling = bBackward ? blockNode.previousElementSibling : blockNode.nextElementSibling;
		if (!blockSibling) return CaretUtils.Clean();

		checker = blockSibling;
	} else {
		const blockSibling = bBackward ? blockNode.previousElementSibling : blockNode.nextElementSibling;
		const listItemSibling = bBackward ? listItem.previousElementSibling : listItem.nextElementSibling;
		const lineSibling = bBackward ? lines[caret.Start.Line].previousElementSibling : lines[caret.Start.Line].nextElementSibling;
		if (blockSibling || listItemSibling || !lineSibling) return CaretUtils.Clean();

		checker = lineSibling;
	}

	if (DOM.Utils.GetNodeName(checker) !== FigureSelector) return CaretUtils.Clean();

	PreventEvent(event);

	const newRange = self.Utils.Range();
	newRange.SetStartToEnd(checker, 0, 0);
	CaretUtils.UpdateRanges(newRange);

	self.Utils.Shared.DispatchCaretChange([checker]);
};

export default Delete;