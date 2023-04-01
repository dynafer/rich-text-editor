import { NodeType } from '@dynafer/dom-control';
import { Str } from '@dynafer/utils';
import Editor from '../../Editor';
import { BlockFormatTags } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';
import { PreventEvent } from '../EventSetupUtils';

const MoveUtils = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;
	const DOM = self.DOM;

	const UpdateRange = (node: Node, offset: number) => {
		PreventEvent(event);
		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(node, offset, offset);
		self.Utils.Caret.UpdateRange(newRange);
		self.Utils.Shared.DispatchCaretChange();
	};

	const UpdateRangeWithDescendants = (figure: Node, target: Element, bBackward: boolean) => {
		const getChild = bBackward ? DOM.Utils.GetLastChild : DOM.Utils.GetFirstChild;
		let child = getChild(target);
		if (child && DOM.Element.Figure.IsFigure(child)) return UpdateRange(child, bBackward ? 1 : 0);

		child = getChild(child, true);

		if (!child) return UpdateRange(figure, bBackward ? 0 : 1);

		const offset = bBackward
			? (NodeType.IsText(child) ? child.length : 0)
			: 0;

		UpdateRange(child, offset);
	};

	const UpdateRangeWithFigure = (figure: Node, bBackward: boolean) => {
		if (!NodeType.IsElement(figure)) return;

		const sibling = bBackward ? figure.previousElementSibling : figure.nextElementSibling;
		if (!sibling) return UpdateRange(figure, bBackward ? 0 : 1);

		UpdateRangeWithDescendants(figure, sibling, bBackward);
	};

	const IsLastOffset = (node: Node, offset: number, bBackward: boolean) => {
		if (NodeType.IsText(node)) {
			const targetOffset = bBackward ? 0 : node.length;
			if (targetOffset !== offset) return false;
		}

		const block = DOM.Closest(FormatUtils.GetParentIfText(node), Str.Join(',', ...BlockFormatTags.Block));
		if (!block) return true;

		let current: Node | null = node;
		while (current) {
			if (current === block || current === self.GetBody()) return true;
			const nextSibling = bBackward ? current.previousSibling : current.nextSibling;
			if (nextSibling) return false;
			current = current.parentNode;
		}

		return true;
	};

	return {
		UpdateRange,
		UpdateRangeWithDescendants,
		UpdateRangeWithFigure,
		IsLastOffset,
	};
};

export default MoveUtils;