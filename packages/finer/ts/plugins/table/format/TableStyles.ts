import { Arr, Obj } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../../packages/Editor';
import { IPluginTableCommand } from '../Type';

const TableStyles = (editor: Editor, format: IPluginTableCommand) => {
	const self = editor;
	const DOM = self.DOM;
	const { Styles, SameStyles, bAsText } = format;

	const wrapStyle = (table: HTMLElement) => {
		const figure = DOM.Element.Figure.GetClosest(table);
		if (!figure) return;

		DOM.RemoveStyles(figure, ...SameStyles);
		const toggleAttr = bAsText ? DOM.SetAttr : DOM.RemoveAttr;
		toggleAttr(figure, Options.ATTRIBUTE_AS_TEXT);

		DOM.SetStyles(figure, Styles);
	};

	const unwrapStyle = (table: HTMLElement) => {
		const figure = DOM.Element.Figure.GetClosest(table);
		if (!figure) return;

		if (bAsText) DOM.RemoveAttr(figure, Options.ATTRIBUTE_AS_TEXT);

		DOM.RemoveStyles(figure, ...Obj.Keys(Styles));
	};

	const Toggle = (bWrap: boolean, table: HTMLElement) => {
		const caret = self.Utils.Caret.Get();
		const cells = DOM.Element.Table.GetSelectedCells(self);

		const toggle = bWrap ? wrapStyle : unwrapStyle;
		toggle(table);

		if (!caret) {
			if (Arr.IsEmpty(cells)) return;
			self.Utils.Caret.CleanRanges();
			DOM.Element.Table.ToggleSelectMultipleCells(true, cells);
			return self.Utils.Shared.DispatchCaretChange();
		}

		self.Utils.Caret.UpdateRange(caret.Range.Clone());
		self.Utils.Shared.DispatchCaretChange();
	};

	return {
		Toggle,
	};
};

export default TableStyles;