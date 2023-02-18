import { FigureSelector, TableSelector } from '../../formatter/Format';
import Editor from '../../Editor';

const HoverTable = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const TableTools = self.Tools.DOM.Table;

	const figure = DOM.Closest(event.target as Element, FigureSelector);
	if (!figure || !DOM.HasAttr(figure, 'type', 'table')) return TableTools.RemoveAll();

	const table = DOM.SelectAll(TableSelector, figure)[0];
	if (!table) return TableTools.RemoveAll();

	const bHasTools = !!DOM.Select({
		attrs: {
			dataType: 'table-tool'
		}
	}, figure);

	if (bHasTools) return;

	DOM.Insert(figure, TableTools.Create(table));
};

export default HoverTable;