import Options from '../../../Options';
import Editor from '../../Editor';
import { FigureSelector, TableSelector } from '../../formatter/Format';

const ClickTable = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const TableTools = self.Tools.DOM.Table;

	if (!event.composedPath()[0]) return;

	const figure = DOM.Closest(event.composedPath()[0] as Element, FigureSelector);
	if (!figure) return TableTools.RemoveAll();

	const table = DOM.SelectAll(TableSelector, figure)[0];
	if (!table) return TableTools.RemoveAll();

	DOM.SetAttr(figure, Options.ATTRIBUTE_FOCUSED, '');

	const bHasTools = !!DOM.Select({
		attrs: {
			dataType: 'table-tool'
		}
	}, figure);

	if (bHasTools) return;

	DOM.Insert(figure, TableTools.Create(table));
};

export default ClickTable;