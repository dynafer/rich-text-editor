import { NodeType } from '@dynafer/dom-control';
import { Str } from '@dynafer/utils';
import Editor from '../../Editor';
import { BlockFormatTags, ListItemSelector } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';
import { PreventEvent } from '../EventSetupUtils';
import { EKeyCode } from './KeyboardUtils';

const MoveCaret = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const bUp = event.key === EKeyCode.ArrowUp || event.code === EKeyCode.ArrowUp;
	const bDown = event.key === EKeyCode.ArrowDown || event.code === EKeyCode.ArrowDown;
	const bLeft = event.key === EKeyCode.ArrowLeft || event.code === EKeyCode.ArrowLeft;
	const bRight = event.key === EKeyCode.ArrowRight || event.code === EKeyCode.ArrowRight;
	const bBackspace = event.key === EKeyCode.Backspace || event.code === EKeyCode.Backspace;
	const bDelete = event.key === EKeyCode.Delete || event.code === EKeyCode.Delete;

	if (!bUp && !bDown && !bLeft && !bRight && !bBackspace && !bDelete) return;

	const bBackward = bUp || bLeft || bBackspace;

	FormatUtils.CleanDirty(self, CaretUtils.Get()[0]);

	const caret = CaretUtils.Get()[0];
	if (!caret || caret.IsRange()) return CaretUtils.Clean();

	const updateRange = (node: Node, offset: number) => {
		PreventEvent(event);
		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(node, offset, offset);
		CaretUtils.UpdateRanges(newRange);

		self.Utils.Shared.DispatchCaretChange();
	};

	const moveOrDeleteInFigure = (): boolean => {
		if (!DOM.Element.Figure.IsFigure(caret.Start.Node)) return false;
		if (bBackspace || bDelete) {
			PreventEvent(event);
			DOM.Remove(caret.Start.Node, true);
			return true;
		}

		const figure = caret.Start.Node as Element;
		if (bLeft && caret.Start.Offset !== 0) {
			updateRange(figure, 0);
			return true;
		}

		if (bRight && caret.Start.Offset !== 1) {
			updateRange(figure, 1);
			return true;
		}

		const target = bBackward ? figure.previousElementSibling : figure.nextElementSibling;
		if (!target) return false;

		const getChild = bBackward ? DOM.Utils.GetLastChild : DOM.Utils.GetFirstChild;
		const child = getChild(target, true);
		if (!child) return false;

		const offset = bBackward
			? (NodeType.IsText(child) ? child.length : 0)
			: 0;

		updateRange(child, offset);
		return true;
	};

	const moveOrDeleteBeforeFigure = () => {
		const blockNode = DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node), Str.Join(',', ...BlockFormatTags.Block));
		if (!blockNode) return;

		const getChild = bBackward ? DOM.Utils.GetFirstChild : DOM.Utils.GetLastChild;
		const targetChild = getChild(blockNode, true);

		const textLength = NodeType.IsText(caret.Start.Node) ? caret.Start.Node.length : DOM.GetText(caret.Start.Node).length;

		if (!targetChild
			|| (bBackward && caret.Start.Offset !== 0)
			|| (!bBackward && textLength > caret.Start.Offset)
		) return;

		const listItem = DOM.Closest(blockNode, ListItemSelector);

		let checker: Element;
		if (!listItem) {
			const blockSibling = bBackward ? blockNode.previousElementSibling : blockNode.nextElementSibling;
			if (!blockSibling) return;

			checker = blockSibling;
		} else {
			const blockSibling = bBackward ? blockNode.previousElementSibling : blockNode.nextElementSibling;
			const listItemSibling = bBackward ? listItem.previousElementSibling : listItem.nextElementSibling;
			const lineSibling = bBackward ? listItem.parentElement?.previousElementSibling : listItem.parentElement?.nextElementSibling;

			if (blockSibling || listItemSibling || !lineSibling) return;

			checker = lineSibling;
		}

		if (!DOM.Element.Figure.IsFigure(checker)) return;

		const offset = bBackward ? 1 : 0;
		updateRange(checker, offset);
	};

	if (moveOrDeleteInFigure()) return CaretUtils.Clean();
	moveOrDeleteBeforeFigure();
	CaretUtils.Clean();
};

export default MoveCaret;