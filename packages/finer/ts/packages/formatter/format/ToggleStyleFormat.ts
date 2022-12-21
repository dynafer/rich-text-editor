import { Arr, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { IStyleFormat } from '../FormatType';
import FormatUtils from '../FormatUtils';

export interface IToggleStyleFormat {
	ToggleFromCaret: (bWrap: boolean, value?: string) => void,
	CalculateFromCaret: (value: string, bSubtract?: boolean) => void,
}

const ToggleStyleFormat = (editor: Editor, formats: IStyleFormat | IStyleFormat[]): IToggleStyleFormat => {
	const self = editor;
	const DOM = self.DOM;
	const Toggler = self.Formatter.Toggler;
	const CaretUtils = self.Utils.Caret;

	const toggleRangeEdge = (bWrap: boolean, node: Node, root: Node, value?: string, bPrevious: boolean = false) => {
		const toggleOption = {
			except: FormatUtils.ExceptNodes(self, node, root, bPrevious),
			endNode: node,
			value
		};
		Toggler.ToggleRecursive(bWrap, formats, root, toggleOption);
	};

	const toggleSameLine = (bWrap: boolean, caret: ICaretData, value?: string) => {
		if (caret.Start.Line !== caret.End.Line) return;

		if (caret.Start.Node === caret.End.Node) return Toggler.Toggle(bWrap, formats, caret.Start.Node, value);

		const toggleOption = {
			except: Arr.MergeUnique(
				FormatUtils.ExceptNodes(self, caret.Start.Node, caret.SameRoot, true),
				FormatUtils.ExceptNodes(self, caret.End.Node, caret.SameRoot)
			),
			endNode: caret.End.Node,
			value,
		};
		Toggler.ToggleRecursive(bWrap, formats, caret.SameRoot, toggleOption);

	};

	const toggleRange = (bWrap: boolean, caret: ICaretData, value?: string) => {
		if (caret.Start.Line === caret.End.Line) return;

		const lines = DOM.GetChildNodes(self.GetBody());

		toggleRangeEdge(bWrap, caret.Start.Node, lines[caret.Start.Line], value, true);
		for (let index = caret.Start.Line + 1; index < caret.End.Line; ++index) {
			const line = lines[index];
			Toggler.ToggleRecursive(bWrap, formats, line, { value });
		}
		toggleRangeEdge(bWrap, caret.End.Node, lines[caret.End.Line], value);
	};

	const calculateRange = (caret: ICaretData, styleName: string, calculateValue: number) => {
		const lines = DOM.GetChildNodes(self.GetBody());

		for (let index = caret.Start.Line; index <= caret.End.Line; ++index) {
			const line = lines[index] as HTMLElement;

			const styleValue = DOM.GetStyle(line, styleName, true);
			const calculated = parseFloat(styleValue) + calculateValue;

			if (calculated <= 0) {
				DOM.RemoveStyle(line, styleName);
				continue;
			}

			DOM.SetStyle(line, styleName, FormatUtils.GetPixelString(calculated));
		}
	};

	const ToggleFromCaret = (bWrap: boolean, value?: string) => {
		self.Focus();

		for (const caret of CaretUtils.Get()) {
			toggleSameLine(bWrap, caret, value);
			toggleRange(bWrap, caret, value);
		}

		CaretUtils.Clean();
	};

	const CalculateFromCaret = (value: string, bSubtract?: boolean) => {
		const format = Type.IsArray(formats) ? formats[0] : formats;
		const { Styles } = format;
		const styleName = Object.keys(Styles)[0];
		const calculateValue = bSubtract ? -1 * parseFloat(value) : parseFloat(value);
		self.Focus();

		for (const caret of CaretUtils.Get()) {
			calculateRange(caret, styleName, calculateValue);
		}

		CaretUtils.Clean();
	};

	return {
		ToggleFromCaret,
		CalculateFromCaret,
	};
};

export default ToggleStyleFormat;