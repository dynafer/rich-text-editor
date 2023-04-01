import { Arr, Type } from '@dynafer/utils';
import Options from '../../../../Options';
import Editor from '../../../Editor';
import { ICaretData } from '../../../editorUtils/caret/CaretUtils';

type TCurrentPoint = ICaretData | HTMLElement[] | undefined;

export const CreateCurrentPoint = (editor: Editor, table: HTMLElement): TCurrentPoint => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	let point: TCurrentPoint = CaretUtils.Get()[0];
	CaretUtils.CleanRanges();

	if (!point) point = DOM.Element.Table.GetSelectedCells(self, table);

	return point;
};

export const MoveToCurrentPoint = (editor: Editor, table: HTMLElement, point: TCurrentPoint) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const selected = DOM.Element.Table.GetSelectedCells(self, table);
	Arr.Each(selected, cell => DOM.RemoveAttr(cell, Options.ATTRIBUTE_SELECTED));

	if (!point) {
		const firstCell = DOM.SelectAll(DOM.Element.Table.CellSelector, table)[0];
		if (!firstCell) return;

		const firstChild = DOM.Utils.GetFirstChild(firstCell, true);
		if (!firstChild) return;

		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(firstChild, 0, 0);
		return CaretUtils.UpdateRanges(newRange);
	}

	if (Type.IsArray(point)) {
		Arr.Each(point, cell => DOM.SetAttr(cell, Options.ATTRIBUTE_SELECTED));
		point = undefined;
		return;
	}

	const newRange = self.Utils.Range();
	newRange.SetStart(point.Start.Node, DOM.Utils.IsBr(point.Start.Node) ? 0 : point.Start.Offset);
	newRange.SetEnd(point.End.Node, DOM.Utils.IsBr(point.End.Node) ? 0 : point.End.Offset);
	CaretUtils.UpdateRanges(newRange);
};

export const CreateFakeTable = (editor: Editor, table: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;

	const fakeTable = DOM.Clone(table, true);
	DOM.SetAttr(fakeTable, 'contenteditable', 'false');
	DOM.SetStyles(fakeTable, {
		margin: '0',
		position: 'absolute',
		left: `${table.offsetLeft}px`,
		top: `${table.offsetTop}px`,
	});

	return fakeTable;
};