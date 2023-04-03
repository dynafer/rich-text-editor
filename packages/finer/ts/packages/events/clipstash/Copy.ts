import { Arr } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { ENativeEvents, PreventEvent } from '../EventSetupUtils';
import InputUtils from '../update/InputUtils';

const Copy = (editor: Editor, event: ClipboardEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const inputUtils = InputUtils(self);

	if (!event.clipboardData) return;

	const caret = self.Utils.Caret.Get();
	if (!caret) {
		const cells = DOM.Element.Table.GetSelectedCells(self);
		if (Arr.IsEmpty(cells)) return;

		const actualTable = DOM.Element.Table.GetClosest(cells[0]);
		if (!actualTable) return;

		PreventEvent(event);
		const { Grid } = DOM.Element.Table.GetGridWithIndex(actualTable);

		const table = DOM.Clone(actualTable);
		Arr.Each(Grid, row => {
			const newRow = DOM.Create(DOM.Element.Table.RowSelector);
			Arr.Each(row, cell => {
				const index = Arr.Find(cells, cell);
				if (index === -1) return;
				const clonedCell = DOM.Clone(cell, true);
				DOM.Insert(newRow, clonedCell);
				DOM.RemoveAttr(clonedCell, Options.ATTRIBUTE_SELECTED);
				Arr.Remove(cells, index);
			});
			if (DOM.Utils.HasChildNodes(newRow)) DOM.Insert(table, newRow);
		});

		event.clipboardData.clearData();
		return event.clipboardData.setData('text/html', DOM.GetOuterHTML(table));
	}

	const bCut = event.type === ENativeEvents.cut;

	if (!caret.IsRange()) {
		if (!DOM.Element.Figure.IsFigure(caret.Start.Node)) return;

		const figureElement = DOM.Element.Figure.SelectFigureElement(caret.Start.Node);
		if (!figureElement) return;

		PreventEvent(event);

		const html = DOM.GetOuterHTML(figureElement);
		if (bCut) DOM.Remove(caret.Start.Node);

		event.clipboardData.clearData();
		return event.clipboardData.setData('text/html', html);
	}

	PreventEvent(event);

	const fragment = inputUtils.GetProcessedFragment(caret, bCut);

	const tools = self.Tools.DOM.Manager.SelectTools(true, fragment);
	Arr.Each(tools, tool => tool.remove());

	const dummyFragment = DOM.Create('fragment');
	DOM.Insert(dummyFragment, ...DOM.GetChildNodes(fragment));
	const html = DOM.GetHTML(dummyFragment);
	dummyFragment.remove();

	event.clipboardData.clearData();
	event.clipboardData.setData('text/html', html);
};

export default Copy;