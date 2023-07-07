import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { IBlockFormat } from '../FormatType';
import FormatUtils from '../FormatUtils';

export interface IToggleBlock {
	ToggleFromCaret: (bWrap: boolean) => void,
}

const ToggleBlock = (editor: Editor, format: IBlockFormat): IToggleBlock => {
	const self = editor;
	const DOM = self.DOM;
	const Toggler = self.Formatter.Toggler;
	const { AddInside } = format;

	const toggleRangeEdge = (bWrap: boolean, node: Node, root: Node, bPrevious: boolean = false) => {
		if (!AddInside.has(DOM.Utils.GetNodeName(root))) return Toggler.Toggle(bWrap, format, root);

		const toggleOption = {
			except: FormatUtils.ExceptNodes(self, node, root, bPrevious),
			endNode: node,
		};

		Toggler.ToggleRecursive(bWrap, format, root, toggleOption);
	};

	const tableProcessor = (bWrap: boolean): boolean => {
		const cells = DOM.Element.Table.GetSelectedCells(self);
		if (Arr.IsEmpty(cells)) return false;

		Arr.Each(cells, cell => Toggler.ToggleRecursive(bWrap, format, cell));

		return true;
	};

	const sameLineProcessor = (bWrap: boolean, caret: ICaretData): boolean => {
		if (caret.Start.Line !== caret.End.Line) return false;

		const startElement = FormatUtils.GetParentIfText(caret.Start.Node);

		if (caret.Start.Node === caret.End.Node
			|| (!DOM.Element.Table.FindClosest(startElement) && !DOM.Closest(startElement, { tagName: Arr.Convert(AddInside) }))
		) {
			Toggler.Toggle(bWrap, format, DOM.GetChildNodes(caret.Start.Node, false)[0] ?? caret.Start.Node);
			return true;
		}

		const toggleOption = {
			except: Arr.MergeUnique(
				FormatUtils.ExceptNodes(self, caret.Start.Node, caret.SameRoot, true),
				FormatUtils.ExceptNodes(self, caret.End.Node, caret.SameRoot)
			),
			endNode: caret.End.Node,
		};

		Toggler.ToggleRecursive(bWrap, format, caret.SameRoot, toggleOption);
		return true;
	};

	const rangeProcessor = (bWrap: boolean, caret: ICaretData): boolean => {
		if (caret.Start.Line === caret.End.Line) return false;

		const lines = self.GetLines();

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

		return true;
	};

	const ToggleFromCaret = (bWrap: boolean) =>
		FormatUtils.SerialiseWithProcessors(self, {
			bWrap,
			tableProcessor,
			processors: [
				{ processor: sameLineProcessor },
				{ processor: rangeProcessor },
			]
		});

	return {
		ToggleFromCaret,
	};
};

export default ToggleBlock;