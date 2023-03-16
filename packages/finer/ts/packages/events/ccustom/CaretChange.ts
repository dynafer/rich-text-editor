import { Arr, Str } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { IEvent } from '../../editorUtils/EventUtils';
import { FigureSelector, TableCellSelector, TableSelector } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';

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
		Arr.Each(paths, path => {
			if (DOM.HasAttr(path, 'caret')) Arr.Push(currentCarets, path);
		});

		Arr.Each(caretPointers, caretPointer => {
			if (Arr.Contains(currentCarets, caretPointer)) return;

			if (!Str.IsEmpty(DOM.GetText(caretPointer))) {
				DOM.SetOuterHTML(caretPointer, DOM.GetHTML(caretPointer));
				return;
			}

			const parents = DOM.GetParents(caretPointer, true);
			Arr.Each(parents, (parent, exit) => {
				if (!Str.IsEmpty(DOM.GetText(parent as HTMLElement))) return exit();

				DOM.Remove(parent as Element, true);
			});
		});
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
		const sameRoot = FormatUtils.GetParentIfText(carets[0]?.SameRoot) ? carets[0]?.SameRoot.parentNode : carets[0]?.SameRoot;

		const figure = DOM.Closest(sameRoot, FigureSelector);
		Arr.Each(DOM.SelectAll({ attrs: [Options.ATTRIBUTE_FOCUSED] }), focused => {
			if (focused === figure) return;
			DOM.RemoveAttr(focused, Options.ATTRIBUTE_FOCUSED);
			TableTools.RemoveAll();
		});

		const bNotSameRootFigure = !!figure && !!carets[0]?.IsRange() && DOM.Closest(sameRoot, FigureSelector) !== figure;
		if (!figure || !DOM.HasAttr(figure, 'type', TableSelector) || bNotSameRootFigure) return CaretUtils.Clean();

		Arr.Each(carets, caret => {
			if (caret.Start.Node !== figure || caret.End.Node !== figure) return;

			const firstCell = DOM.SelectAll(TableCellSelector, figure)[0];
			if (!firstCell) return;

			let firstChild: Node | null = DOM.Utils.GetFirstChild(firstCell, true);
			if (DOM.Utils.IsBr(firstChild)) firstChild = firstChild.parentNode;

			if (!firstChild) return;

			caret.Range.SetStartToEnd(firstChild, 1, 1);
			CaretUtils.UpdateRanges([caret.Range.Clone()]);
		});

		if (DOM.HasAttr(figure, Options.ATTRIBUTE_FOCUSED)) return CaretUtils.Clean();

		addTableTools(figure);

		DOM.SetAttr(figure, Options.ATTRIBUTE_FOCUSED, '');
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