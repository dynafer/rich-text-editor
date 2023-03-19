import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import { TableCellSelector, TableSelector } from '../formatter/Format';
import FormatUtils from '../formatter/FormatUtils';

interface ISplitedLines {
	startBlock: Node | null,
	endBlock: Node | null,
}

export interface ISharedUtils {
	DispatchCaretChange: (paths?: Node[]) => void,
	SplitLines: (node: Node, offset: number) => ISplitedLines,
}

const SharedUtils = (editor: Editor): ISharedUtils => {
	const self = editor;
	const DOM = self.DOM;

	const DispatchCaretChange = (paths: Node[] = []) => {
		const newPaths: Node[] = [...paths];

		const carets = self.Utils.Caret.Get();

		if ((newPaths.length === 1 || !!DOM.Select(TableSelector, newPaths[0])) && carets[0])
			Arr.Push(newPaths, ...Arr.MergeUnique(carets[0].Start.Path, carets[0].End.Path));

		if (!Arr.IsEmpty(newPaths)) return self.Dispatch('caret:change', newPaths);

		if (!Arr.IsEmpty(carets)) {
			Arr.Push(newPaths, ...Arr.Reverse(Arr.MergeUnique(carets[0].Start.Path, carets[0].End.Path)));
			return self.Dispatch('caret:change', newPaths);
		}

		const selectedCells = self.Formatter.Utils.GetTableItems(self, true);
		if (Arr.IsEmpty(selectedCells)) return self.Dispatch('caret:change', newPaths);

		Arr.Push(newPaths, ...DOM.GetChildren(selectedCells[0] as HTMLElement));
		self.Dispatch('caret:change', newPaths);
	};

	const SplitLines = (node: Node, offset: number): ISplitedLines => {
		let startBlock: Node | null = null;
		let endBlock: Node | null = null;

		if (!DOM.Utils.IsText(node)) return {
			startBlock,
			endBlock,
		};

		const until = DOM.Closest(FormatUtils.GetParentIfText(node), TableCellSelector) ?? self.GetBody();
		const nextText = node.splitText(offset);
		const nextTextParent = nextText.parentNode;

		let currentParent: Node | null = nextTextParent;
		let currentNode: Node | null = nextText;
		while (currentParent && currentParent !== until) {
			const parentBlock = DOM.Clone(currentParent);
			if (endBlock) DOM.Insert(parentBlock, endBlock);

			while (currentNode) {
				DOM.CloneAndInsert(parentBlock, true, currentNode);
				const savedNode = currentNode;
				currentNode = currentNode.nextSibling;

				if (!DOM.Utils.IsText(savedNode)) {
					DOM.Remove(savedNode as Element);
					continue;
				}

				currentParent.removeChild(savedNode);
			}

			if (DOM.GetChildNodes(parentBlock).length >= 1) {
				if (currentParent !== nextTextParent
					|| (currentParent === nextTextParent && nextText.length !== 0)
				) endBlock = parentBlock;
			}

			if (currentParent.parentNode === until) startBlock = currentParent;

			currentNode = currentParent.nextSibling;
			currentParent = currentParent.parentNode;
		}

		return {
			startBlock,
			endBlock,
		};
	};

	return {
		DispatchCaretChange,
		SplitLines,
	};
};

export default SharedUtils;