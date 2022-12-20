import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { BlockFormatTags } from '../Format';
import { IBlockFormat } from '../FormatType';
import FormatUtils from '../FormatUtils';

export interface IToggleBlock {
	ToggleFromCaret: (bWrap: boolean) => void,
}

const ToggleBlock = (editor: Editor, format: IBlockFormat): IToggleBlock => {
	const self = editor;
	const DOM = self.DOM;
	const Toggler = self.Formatter.Toggler;
	const CaretUtils = self.Utils.Caret;
	const { AddInside } = format;

	const addInsideSelector = Array.from(AddInside).join(', ');

	const toggleRangeEdge = (bWrap: boolean, node: Node, root: Node, bPrevious: boolean = false) => {
		if (!AddInside.has(DOM.Utils.GetNodeName(root))) return Toggler.Toggle(bWrap, format, root);

		const toggleOption = {
			except: FormatUtils.ExceptNodes(self, node, root, bPrevious),
			endNode: node,
		};

		Toggler.ToggleRecursive(bWrap, format, root, toggleOption);
	};

	const processSameLine = (bWrap: boolean, caret: ICaretData) => {
		if (caret.Start.Line !== caret.End.Line) return;

		const startElement = FormatUtils.GetParentIfText(caret.Start.Node) as Element;

		if (
			(!DOM.Closest(startElement, Array.from(BlockFormatTags.Table).join(',')) && !DOM.Closest(startElement, addInsideSelector))
			|| caret.Start.Node === caret.End.Node
		) return Toggler.Toggle(bWrap, format, caret.Start.Node.childNodes[0] ?? caret.Start.Node);

		const toggleOption = {
			except: Arr.MergeUnique(
				FormatUtils.ExceptNodes(self, caret.Start.Node, caret.SameRoot, true),
				FormatUtils.ExceptNodes(self, caret.End.Node, caret.SameRoot)
			),
			endNode: caret.End.Node,
		};

		Toggler.ToggleRecursive(bWrap, format, caret.SameRoot, toggleOption);
	};

	const processRange = (bWrap: boolean, caret: ICaretData) => {
		if (caret.Start.Line === caret.End.Line) return;

		const lines = self.GetBody().childNodes;

		toggleRangeEdge(bWrap, caret.Start.Node, lines[caret.Start.Line], true);
		for (let index = caret.Start.Line + 1; index < caret.End.Line; ++index) {
			const line = lines[index];
			if (AddInside.has(DOM.Utils.GetNodeName(line))) {
				Toggler.ToggleRecursive(bWrap, format, line);
				continue;
			}

			Toggler.Toggle(bWrap, format, line);
		}
		toggleRangeEdge(bWrap, caret.End.Node, lines[caret.End.Line]);
	};

	const ToggleFromCaret = (bWrap: boolean) => {
		self.Focus();

		for (const caret of CaretUtils.Get()) {
			processSameLine(bWrap, caret);
			processRange(bWrap, caret);
		}

		CaretUtils.Clean();
	};

	return {
		ToggleFromCaret,
	};
};

export default ToggleBlock;