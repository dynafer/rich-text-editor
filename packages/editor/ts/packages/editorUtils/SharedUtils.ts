import { NodeType } from '@dynafer/dom-control';
import { Arr } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { BlockFormatTags } from '../formatter/Format';
import FormatUtils from '../formatter/FormatUtils';
import { ICaretData } from './caret/CaretUtils';

interface ISplitedLines {
	readonly StartBlock: Node | null,
	readonly EndBlock: Node | null,
}

export interface ISharedUtils {
	DispatchCaretChange: (paths?: Node[]) => void,
	SplitLines: (node: Node, offset: number) => ISplitedLines,
	DeleteRange: (caret: ICaretData | null) => void,
}

const SharedUtils = (editor: Editor): ISharedUtils => {
	const self = editor;

	const DispatchCaretChange = (paths: Node[] = []) => {
		const newPaths: Node[] = [...paths];

		const caret = self.Utils.Caret.Get();

		if (caret && (newPaths.length === 1 || !!self.DOM.Select(DOM.Element.Table.Selector, newPaths[0])))
			Arr.Push(newPaths, ...Arr.MergeUnique(caret.Start.Path, caret.End.Path));

		if (!Arr.IsEmpty(newPaths)) return self.Dispatch('Caret:Change', newPaths);

		if (caret) {
			Arr.Push(newPaths, ...Arr.Reverse(Arr.MergeUnique(caret.Start.Path, caret.End.Path)));
			return self.Dispatch('Caret:Change', newPaths);
		}

		const selectedCells = DOM.Element.Table.GetSelectedCells(self);
		if (Arr.IsEmpty(selectedCells)) return self.Dispatch('Caret:Change', newPaths);

		Arr.Push(newPaths, ...DOM.GetChildren(selectedCells[0]));
		self.Dispatch('Caret:Change', newPaths);
	};

	const SplitLines = (node: Node, offset: number): ISplitedLines => {
		let StartBlock: Node | null = null;
		let EndBlock: Node | null = null;

		if (!NodeType.IsText(node)) return {
			StartBlock,
			EndBlock,
		};

		const until = DOM.Element.Table.FindClosestCell(FormatUtils.GetParentIfText(node)) ?? self.GetBody();
		const nextText = node.splitText(offset);
		const nextTextParent = nextText.parentNode;

		let currentParent: Node | null = nextTextParent;
		let currentNode: Node | null = nextText;
		while (currentParent && currentParent !== until) {
			const parentBlock = DOM.Clone(currentParent);
			if (EndBlock) DOM.Insert(parentBlock, EndBlock);

			while (currentNode) {
				DOM.CloneAndInsert(parentBlock, true, currentNode);
				const savedNode = currentNode;
				currentNode = currentNode.nextSibling;

				if (!NodeType.IsText(savedNode)) {
					DOM.Remove(savedNode);
					continue;
				}

				currentParent.removeChild(savedNode);
			}

			const bEndBlock = currentParent !== nextTextParent || (currentParent === nextTextParent && nextText.length !== 0);
			if (DOM.GetChildNodes(parentBlock).length >= 1 && bEndBlock) EndBlock = parentBlock;

			if (currentParent.parentNode === until) StartBlock = currentParent;

			currentNode = currentParent.nextSibling;
			currentParent = currentParent.parentNode;
		}

		return {
			StartBlock,
			EndBlock,
		};
	};

	const DeleteRange = (caret: ICaretData | null) => {
		if (!caret?.IsRange()) return;

		const bInBlock = !!DOM.Closest(FormatUtils.GetParentIfText(caret.SameRoot), { tagName: Arr.Convert(BlockFormatTags.Block) });
		if (caret.Start.Node === caret.End.Node || bInBlock) return caret.Range.DeleteContents();

		const lines = self.GetLines(false);
		const firstChild = DOM.Utils.GetFirstChild(lines[0], true);
		const lastChild = DOM.Utils.GetLastChild(lines[lines.length - 1], true);

		const bSelectedAll = firstChild === caret.Start.Node
			&& caret.Start.Offset === 0
			&& lastChild === caret.End.Node
			&& (NodeType.IsText(lastChild) ? lastChild.length : 0) === caret.End.Offset;

		caret.Range.DeleteContents();

		if (!bSelectedAll) return;
		while (lines.length > 1) {
			const line = lines[1] ?? null;
			DOM.Remove(line, true);
		}
	};

	return {
		DispatchCaretChange,
		SplitLines,
		DeleteRange,
	};
};

export default SharedUtils;