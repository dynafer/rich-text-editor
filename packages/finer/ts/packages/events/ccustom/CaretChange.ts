import { Arr, Str } from '@dynafer/utils';
import TableTools from '../../dom/TableTools';
import { IEvent } from '../../editorUtils/EventUtils';
import { FigureSelector, TableCellSelector, TableSelector } from '../../formatter/Format';
import Editor from '../../Editor';
import { ChangeMovablePosition } from '../EventSetupUtils';

const CaretChange = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const tableTools = TableTools(self);

	const removeCaretPointers = (paths: Node[]) => {
		const caretPointers = DOM.SelectAll({
			attrs: 'caret'
		});
		if (Arr.IsEmpty(caretPointers)) return;

		const currentCarets: Node[] = [];
		for (const path of paths) {
			if (DOM.HasAttr(path, 'caret')) Arr.Push(currentCarets, path);
		}

		for (const caretPointer of caretPointers) {
			if (Arr.Contains(currentCarets, caretPointer)) continue;

			if (!Str.IsEmpty(DOM.GetText(caretPointer))) {
				DOM.SetOuterHTML(caretPointer, DOM.GetHTML(caretPointer));
				continue;
			}

			const parents = DOM.GetParents(caretPointer, true);
			for (const parent of parents) {
				if (!Str.IsEmpty(DOM.GetText(parent as HTMLElement))) break;

				DOM.Remove(parent as Element, true);
			}
		}
	};

	const addTableTools = (figure: Element) => {
		const table = DOM.SelectAll(TableSelector, figure)[0];
		if (!table) return;

		DOM.Insert(figure, tableTools.Create(table));
	};

	const removeTableTools = (figure: Element) => {
		const table = DOM.SelectAll(TableSelector, figure)[0];
		if (!table) return;

		DOM.Remove(DOM.Select({
			attrs: {
				dataType: 'table-tool'
			}
		}, figure));
	};

	const setFocusTable = (paths: Node[]) => {
		if (!paths[0]) return;

		const carets = CaretUtils.Get();
		const node = DOM.Utils.IsText(paths[0]) ? paths[0].parentNode : paths[0];
		const sameRoot = DOM.Utils.IsText(carets[0]?.SameRoot) ? carets[0]?.SameRoot.parentNode : carets[0]?.SameRoot;

		const figure = DOM.Closest(node as Element, FigureSelector);
		for (const focused of DOM.SelectAll({ attrs: ['data-focused'] })) {
			if (focused === figure) continue;
			removeTableTools(focused);
			DOM.RemoveAttr(focused, 'data-focused');
		}

		const bNotSameRootFigure = !!figure && !!carets[0]?.IsRange() && DOM.Closest(sameRoot as Element, FigureSelector) !== figure;
		if (!figure || !DOM.HasAttr(figure, 'type', TableSelector) || bNotSameRootFigure) return;

		for (const caret of carets) {
			if (caret.Start.Node !== figure || caret.End.Node !== figure) continue;

			const firstCell = DOM.SelectAll(TableCellSelector, figure)[0];
			if (!firstCell) continue;

			let firstChild: Node | null = DOM.Utils.GetFirstChild(firstCell, true);
			if (DOM.Utils.IsBr(firstChild)) firstChild = firstChild.parentNode;

			if (!firstChild) continue;

			caret.Range.SetStartToEnd(firstChild, 1, 1);
			CaretUtils.UpdateRanges([caret.Range.Clone()]);
		}

		if (DOM.HasAttr(figure, 'data-focused')) return;

		addTableTools(figure);

		DOM.SetAttr(figure, 'data-focused', '');
	};

	const listener = (): IEvent<Node[]> =>
		(paths: Node[]) => {
			ChangeMovablePosition(self);
			removeCaretPointers(paths);
			setFocusTable(paths);
		};

	self.On('caret:change', listener());
};

export default CaretChange;