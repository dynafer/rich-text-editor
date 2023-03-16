import { Arr, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { FigureSelector } from '../Format';
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

	const tableProcessor = (bWrap: boolean, value?: string): boolean => {
		const cells = FormatUtils.GetTableItems(self, true);
		if (cells.length === 0) return false;

		for (const cell of cells) {
			Toggler.ToggleRecursive(bWrap, formats, cell, { value });
		}

		return true;
	};

	const sameLineProcessor = (bWrap: boolean, caret: ICaretData, value?: string): boolean => {
		if (caret.Start.Line !== caret.End.Line) return false;

		if (caret.Start.Node === caret.End.Node) {
			Toggler.Toggle(bWrap, formats, caret.Start.Node, value);
			return true;
		}

		const toggleOption = {
			except: Arr.MergeUnique(
				FormatUtils.ExceptNodes(self, caret.Start.Node, caret.SameRoot, true),
				FormatUtils.ExceptNodes(self, caret.End.Node, caret.SameRoot)
			),
			endNode: caret.End.Node,
			value,
		};
		Toggler.ToggleRecursive(bWrap, formats, caret.SameRoot, toggleOption);

		return true;
	};

	const rangeProcessor = (bWrap: boolean, caret: ICaretData, value?: string): boolean => {
		if (caret.Start.Line === caret.End.Line) return false;

		const lines = DOM.GetChildNodes(self.GetBody());

		toggleRangeEdge(bWrap, caret.Start.Node, lines[caret.Start.Line], value, true);
		for (let index = caret.Start.Line + 1; index < caret.End.Line; ++index) {
			const line = lines[index];
			Toggler.ToggleRecursive(bWrap, formats, line, { value });
		}
		toggleRangeEdge(bWrap, caret.End.Node, lines[caret.End.Line], value);

		return true;
	};

	const calculateRange = (caret: ICaretData, styleName: string, calculateValue: number) => {
		const lines = DOM.GetChildNodes(self.GetBody());

		const toggleStyle = (element: HTMLElement) => {
			const styleValue = DOM.GetStyle(element, styleName, true);
			const calculated = parseFloat(styleValue) + calculateValue;

			const toggle = calculated <= 0 ? DOM.RemoveStyle : DOM.SetStyle;
			toggle(element, styleName, FormatUtils.GetPixelString(calculated));
		};

		const cells = FormatUtils.GetTableItems(self, true);
		if (!Arr.IsEmpty(cells)) {
			const figure = DOM.Closest(cells[0], FigureSelector) as HTMLElement | null;
			if (!figure) return;
			return toggleStyle(figure);
		}

		for (let index = caret.Start.Line; index <= caret.End.Line; ++index) {
			toggleStyle(lines[index] as HTMLElement);
		}
	};

	const ToggleFromCaret = (bWrap: boolean, value?: string) =>
		FormatUtils.SerialiseWithProcessors(self, {
			bWrap,
			value,
			tableProcessor,
			processors: [
				{ processor: sameLineProcessor },
				{ processor: rangeProcessor },
			]
		});

	const CalculateFromCaret = (value: string, bSubtract?: boolean) => {
		const format = Type.IsArray(formats) ? formats[0] : formats;
		const { Styles } = format;
		const styleName = Object.keys(Styles)[0];
		const calculateValue = bSubtract ? -1 * parseFloat(value) : parseFloat(value);

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