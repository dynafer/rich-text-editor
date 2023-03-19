import { Arr, Str } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { IRangeUtils } from '../../editorUtils/caret/RangeUtils';
import { IEvent } from '../../editorUtils/EventUtils';
import { FigureSelector, TableCellSelector, TableSelector } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';

const CaretChange = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const DOMTools = self.Tools.DOM;

	const removeCaretPointers = (paths: Node[]) => {
		const caretPointers = DOM.SelectAll({
			attrs: 'caret'
		}, self.GetBody());
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

	const addDOMTools = (figure: Element, figureType: string) => {
		const bHasTool = !!DOM.Select({
			attrs: {
				dataFixed: 'dom-tool'
			}
		}, figure);
		if (bHasTool) return;

		const figureElement = DOM.SelectAll(figureType, figure)[0];
		if (!figureElement) return;

		DOM.Insert(figure, DOMTools.Create(figureType, figureElement));
	};

	const setFocusFigure = () => {
		if (DOM.HasAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING)) return;

		const carets = CaretUtils.Get();
		const node = FormatUtils.GetParentIfText(carets[0]?.Start.Node);

		const figure = DOM.Closest(node, FigureSelector);
		Arr.Each(DOM.SelectAll({ attrs: [Options.ATTRIBUTE_FOCUSED] }, self.GetBody()), (focused, exit) => {
			if (focused === figure) return;
			DOM.RemoveAttr(focused, Options.ATTRIBUTE_FOCUSED);
			DOMTools.RemoveAll(figure);
			exit();
		});

		const bNotNodeFigure = !!figure && !!carets[0]?.IsRange() && DOM.Closest(node, FigureSelector) !== figure;
		const figureType = DOM.GetAttr(figure, 'type');
		if (!figure || !figureType || bNotNodeFigure) return CaretUtils.Clean();

		const newRanges: IRangeUtils[] = [];

		Arr.Each(carets, caret => {
			if (caret.Start.Node !== figure || caret.End.Node !== figure) return;

			if (figureType !== TableSelector) {
				caret.Range.SetStartToEnd(figure, 1, 1);
				return Arr.Push(newRanges, caret.Range.Clone());
			}

			const firstCell = DOM.SelectAll(TableCellSelector, figure)[0];
			if (!firstCell) return;

			let firstChild: Node | null = DOM.Utils.GetFirstChild(firstCell, true);
			if (DOM.Utils.IsBr(firstChild)) firstChild = firstChild.parentNode;

			if (!firstChild) return;

			caret.Range.SetStartToEnd(firstChild, 1, 1);
			return Arr.Push(newRanges, caret.Range.Clone());
		});

		if (!Arr.IsEmpty(newRanges)) CaretUtils.UpdateRanges(newRanges);

		addDOMTools(figure, figureType);

		if (!DOM.HasAttr(figure, Options.ATTRIBUTE_FOCUSED)) DOM.SetAttr(figure, Options.ATTRIBUTE_FOCUSED, '');
	};

	const listener = (): IEvent<Node[]> =>
		(paths: Node[]) => {
			self.Tools.DOM.ChangePositions();
			removeCaretPointers(paths);
			setFocusFigure();
		};

	self.On('caret:change', listener());
};

export default CaretChange;