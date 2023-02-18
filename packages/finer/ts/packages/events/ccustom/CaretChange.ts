import { Arr, Str } from '@dynafer/utils';
import { IEvent } from '../../editorUtils/EventUtils';
import { FigureSelector, TableCellSelector, TableSelector } from '../../formatter/Format';
import Editor from '../../Editor';

const CaretChange = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const TableTools = self.Tools.DOM.Table;

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
		const bHasTool = !!DOM.Select({
			attrs: {
				dataType: 'table-tool'
			}
		}, figure);
		if (bHasTool) return;

		const table = DOM.SelectAll(TableSelector, figure)[0];
		if (!table) return;

		DOM.Insert(figure, TableTools.Create(table));
	};

	const setFocusTable = () => {
		const carets = CaretUtils.Get();
		const sameRoot = DOM.Utils.IsText(carets[0]?.SameRoot) ? carets[0]?.SameRoot.parentNode : carets[0]?.SameRoot;

		const figure = DOM.Closest(sameRoot as Element, FigureSelector);
		for (const focused of DOM.SelectAll({ attrs: ['data-focused'] })) {
			if (focused === figure) continue;
			DOM.RemoveAttr(focused, 'data-focused');
			TableTools.RemoveAll();
		}

		const bNotSameRootFigure = !!figure && !!carets[0]?.IsRange() && DOM.Closest(sameRoot as Element, FigureSelector) !== figure;
		if (!figure || !DOM.HasAttr(figure, 'type', TableSelector) || bNotSameRootFigure) return CaretUtils.Clean();

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

		if (DOM.HasAttr(figure, 'data-focused')) return CaretUtils.Clean();

		addTableTools(figure);

		DOM.SetAttr(figure, 'data-focused', '');
	};

	const listener = (): IEvent<Node[]> =>
		(paths: Node[]) => {
			TableTools.ChangePositions();
			removeCaretPointers(paths);
			setFocusTable();
		};

	self.On('caret:change', listener());
};

export default CaretChange;