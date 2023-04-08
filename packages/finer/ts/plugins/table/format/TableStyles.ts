import { Obj } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../../packages/Editor';
import { IPluginTableMenuFormatUI } from '../Type';

const TableStyles = (editor: Editor, format: IPluginTableMenuFormatUI) => {
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
		const toggle = bWrap ? wrapStyle : unwrapStyle;
		toggle(table);
		self.Tools.DOM.ChangePositions();
	};

	return {
		Toggle,
	};
};

export default TableStyles;