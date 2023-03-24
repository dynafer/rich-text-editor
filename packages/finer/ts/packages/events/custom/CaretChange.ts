import { Arr, Str } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { IRangeUtils } from '../../editorUtils/caret/RangeUtils';
import { IEvent } from '../../editorUtils/EventUtils';
import { FigureElementFormats, TableCellSelector, TableSelector } from '../../formatter/Format';
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
				if (!Str.IsEmpty(DOM.GetText(parent))) return exit();

				DOM.Remove(parent, true);
			});
		});
	};

	const wrapFigure = () => {
		const figureElements = DOM.SelectAll({
			tagName: Array.from(FigureElementFormats)
		}, self.GetBody());

		let currentElement: HTMLElement | undefined = undefined;
		while (!Arr.IsEmpty(figureElements)) {
			currentElement = Arr.Shift(figureElements);
			if (!currentElement?.parentElement || !DOM.Element.Figure.IsFigure(currentElement)) continue;

			const elementName = DOM.Utils.GetNodeName(currentElement);
			const currentFigure = DOM.Element.Figure.GetClosest(currentElement);

			const figure = currentFigure ?? DOM.Element.Figure.Create(elementName);

			if (!currentFigure) {
				DOM.InsertAfter(currentElement, figure);
				DOM.Insert(figure, currentElement);
			}

			const bhasTool = !!DOM.Select({
				attrs: {
					dataFixed: 'dom-tool'
				}
			}, figure);

			if (bhasTool) continue;

			const tools = self.Tools.DOM.Create(elementName, currentElement);
			DOM.Insert(figure, tools);
		}
		currentElement = undefined;
	};

	const setFocusFigure = () => {
		if (DOM.HasAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING)) return;

		const carets = CaretUtils.Get();
		const node = FormatUtils.GetParentIfText(carets[0]?.Start.Node);

		const { Figure, FigureType } = DOM.Element.Figure.Find<HTMLImageElement>(node);

		Arr.Each(DOM.SelectAll({ attrs: [Options.ATTRIBUTE_FOCUSED] }, self.GetBody()), (focused, exit) => {
			if (focused === Figure) return;
			DOM.RemoveAttr(focused, Options.ATTRIBUTE_FOCUSED);
			DOMTools.HideAll(Figure);
			exit();
		});

		const bNotNodeFigure = !!Figure && !!carets[0]?.IsRange() && DOM.Element.Figure.GetClosest(node) !== Figure;
		if (!Figure || !FigureType || bNotNodeFigure) return CaretUtils.Clean();

		const newRanges: IRangeUtils[] = [];

		Arr.Each(carets, caret => {
			if (caret.Start.Node !== Figure || caret.End.Node !== Figure) return;

			if (FigureType !== TableSelector) {
				caret.Range.SetStartToEnd(Figure, caret.Start.Offset, caret.Start.Offset);
				return Arr.Push(newRanges, caret.Range.Clone());
			}

			const firstCell = DOM.SelectAll(TableCellSelector, Figure)[0];
			if (!firstCell) return;

			let firstChild: Node | null = DOM.Utils.GetFirstChild(firstCell, true);
			if (DOM.Utils.IsBr(firstChild)) firstChild = firstChild.parentNode;

			if (!firstChild) return;

			caret.Range.SetStartToEnd(firstChild, 1, 1);
			return Arr.Push(newRanges, caret.Range.Clone());
		});

		if (!Arr.IsEmpty(newRanges)) CaretUtils.UpdateRanges(newRanges);

		if (!DOM.HasAttr(Figure, Options.ATTRIBUTE_FOCUSED)) DOM.SetAttr(Figure, Options.ATTRIBUTE_FOCUSED, '');
		DOMTools.ChangePositions();
	};

	const listener = (): IEvent<Node[]> =>
		(paths: Node[]) => {
			DOMTools.ChangePositions();
			removeCaretPointers(paths);
			wrapFigure();
			setFocusFigure();
		};

	self.On('caret:change', listener());
};

export default CaretChange;