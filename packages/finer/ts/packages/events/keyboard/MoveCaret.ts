import { NodeType } from '@dynafer/dom-control';
import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import { BlockFormatTags, ListItemSelector } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';
import { EKeyCode } from './KeyboardUtils';
import MoveInTable from './MoveInTable';
import MoveUtils from './MoveUtils';

const MoveCaret = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const bTab = event.key === EKeyCode.Tab || event.code === EKeyCode.Tab;
	const bShift = event.shiftKey;

	const bUp = event.key === EKeyCode.ArrowUp || event.code === EKeyCode.ArrowUp;
	const bDown = event.key === EKeyCode.ArrowDown || event.code === EKeyCode.ArrowDown;
	const bLeft = event.key === EKeyCode.ArrowLeft || event.code === EKeyCode.ArrowLeft;
	const bRight = event.key === EKeyCode.ArrowRight || event.code === EKeyCode.ArrowRight;
	const bBackspace = event.key === EKeyCode.Backspace || event.code === EKeyCode.Backspace;
	const bDelete = event.key === EKeyCode.Delete || event.code === EKeyCode.Delete;

	const bMoveLeft = (bShift && bTab) || bLeft;
	const bMoveRight = (!bShift && bTab) || bRight;

	if (!bUp && !bDown && !bMoveLeft && !bMoveRight && !bBackspace && !bDelete) return;

	const bBackward = bUp || bLeft || bBackspace;

	FormatUtils.CleanDirtyWithCaret(self, CaretUtils.Get());

	const caret = CaretUtils.Get();
	if (!caret || caret.IsRange()) return;

	const moveUtils = MoveUtils(self, event);

	const moveOrDeleteInFigure = (): boolean => {
		if (!DOM.Element.Figure.Is(caret.Start.Node)) return false;

		const { Figure, FigureType, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(caret.Start.Node);
		if (!Figure || !FigureType || !FigureElement) return false;

		if (bBackspace || bDelete) {
			self.History.Archiver.Path.Record();
			self.History.Archiver.Path.Archive();
			const bPrevious = !!Figure.previousElementSibling;
			const sibling = Figure.previousElementSibling ?? Figure.nextElementSibling;
			if (!sibling) {
				const newParagraph = self.CreateEmptyParagraph();
				DOM.InsertAfter(Figure, newParagraph);
				moveUtils.UpdateRange(DOM.Utils.GetFirstChild(newParagraph) as Element, 0);
			} else if (DOM.Element.Figure.Is(sibling)) {
				moveUtils.UpdateRange(sibling, bPrevious ? 1 : 0);
			} else {
				moveUtils.UpdateRangeWithDescendants(sibling, sibling, bPrevious);
			}
			DOM.Remove(Figure, true);
			self.History.Archiver.History.Record();
			return true;
		}

		if (DOM.Element.Table.Is(FigureElement)) return false;

		if ((bLeft && caret.Start.Offset !== 0) || (bRight && caret.Start.Offset !== 1)) {
			moveUtils.UpdateRange(Figure, bLeft ? 0 : 1);
			return true;
		}

		moveUtils.UpdateRangeWithFigure(Figure, bBackward);
		return true;
	};

	const moveOrDeleteBeforeFigure = () => {
		const blockNode = DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node), { tagName: Arr.Convert(BlockFormatTags.Block) });
		if (!blockNode) return;

		const getChild = bBackward ? DOM.Utils.GetFirstChild : DOM.Utils.GetLastChild;
		const targetChild = getChild(blockNode, true);

		const textLength = NodeType.IsText(caret.Start.Node) ? caret.Start.Node.length : DOM.GetText(caret.Start.Node).length;

		if (!targetChild
			|| (bBackward && caret.Start.Offset !== 0)
			|| (!bBackward && textLength > caret.Start.Offset)
			|| !moveUtils.IsLastOffset(caret.Start.Node, caret.Start.Offset, bBackward)
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

		if (!DOM.Element.Figure.Is(checker)) return;

		const offset = bBackward ? 1 : 0;
		moveUtils.UpdateRange(checker, offset);
	};

	const exit = () => self.Utils.Shared.DispatchCaretChange();

	if (moveOrDeleteInFigure()) return exit();
	if (MoveInTable(self, event, caret)) return exit();
	moveOrDeleteBeforeFigure();
	exit();
};

export default MoveCaret;