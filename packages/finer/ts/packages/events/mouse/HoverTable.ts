import Editor from '../../Editor';
import { FigureSelector, TableSelector } from '../../formatter/Format';

const HoverTable = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const TableTools = self.Tools.DOM.Table;

	const caret = self.Utils.Caret.Get()[0];
	if (caret?.IsRange()) {
		TableTools.RemoveAll();
		return self.Utils.Caret.Clean();
	}

	self.Utils.Caret.Clean();

	const figure = DOM.Closest((event.composedPath()[0] ?? event.target) as Element, FigureSelector);
	if (!figure || !DOM.HasAttr(figure, 'type', 'table')) return TableTools.RemoveAll();

	const table = DOM.SelectAll(TableSelector, figure)[0];
	if (!table) return TableTools.RemoveAll();

	const tools = DOM.SelectAll({
		attrs: {
			dataType: 'table-tool'
		}
	}, figure);

	if (tools.length >= 1) {
		let target: HTMLElement | undefined;
		for (const tool of tools) {
			if (DOM.Closest(tool, FigureSelector) !== figure) continue;
			target = tool;
		}
		if (target) DOM.RemoveAttr(target, 'data-type');
		TableTools.RemoveAll();
		if (target) return DOM.SetAttr(target, 'data-type', 'table-tool');
	}

	DOM.Insert(figure, TableTools.Create(table));
};

export default HoverTable;