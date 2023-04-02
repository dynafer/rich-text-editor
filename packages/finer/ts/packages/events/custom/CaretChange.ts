import { Arr, Str } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { IRangeUtils } from '../../editorUtils/caret/RangeUtils';
import { IEvent } from '../../editorUtils/EventUtils';
import { BlockFormatTags, FigureElementFormats } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';

const CaretChange = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const DOMTools = self.Tools.DOM;

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

			if (!Str.IsEmpty(DOM.GetText(caretPointer))) return DOM.SetOuterHTML(caretPointer, DOM.GetHTML(caretPointer));

			const until = DOM.Closest(caretPointer, Str.Join(',', ...BlockFormatTags.Block))
				?? DOM.Closest(caretPointer, Str.Join(',', ...BlockFormatTags.FollowingItems))
				?? self.GetBody();

			const parents = DOM.GetParents(caretPointer, true);
			Arr.Each(parents, (parent, exit) => {
				if (!Str.IsEmpty(DOM.GetText(parent)) || parent === until) {
					if (!DOM.Utils.HasChildNodes(parent)) DOM.Insert(parent, DOM.Create('br'));
					return exit();
				}

				DOM.Remove(parent, true);
			});
		});
	};

	const wrapFigure = () => {
		const figureElements = DOM.SelectAll<HTMLElement>({
			tagName: Arr.Convert(FigureElementFormats)
		});

		let currentElement: HTMLElement | undefined = undefined;
		while (!Arr.IsEmpty(figureElements)) {
			currentElement = Arr.Shift(figureElements);
			if (!currentElement?.parentElement || !DOM.Element.Figure.IsFigure(currentElement)) continue;

			const currentFigure = DOM.Element.Figure.GetClosest(currentElement);

			const figureType = DOM.Element.Figure.FindType(DOM.Utils.GetNodeName(currentElement));
			const figure = currentFigure ?? DOM.Element.Figure.Create(figureType);

			if (!currentFigure) {
				DOM.InsertAfter(currentElement, figure);
				DOM.Insert(figure, currentElement);
			}

			if (!!DOMTools.Manager.SelectTools(false, figure)) continue;

			const tools = DOMTools.Create(figureType, currentElement);
			DOM.Insert(figure, tools);
		}
		currentElement = undefined;
	};

	const setFocusFigure = () => {
		if (DOM.HasAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING)) return;

		const caret = CaretUtils.Get();
		if (!caret) return;

		const node = FormatUtils.GetParentIfText(caret.Start.Node);

		const { Figure, FigureElement } = DOM.Element.Figure.Find(node);

		DOMTools.UnsetAllFocused(Figure);

		const bNotNodeFigure = !!Figure && !!caret?.IsRange() && DOM.Element.Figure.GetClosest(node) !== Figure;
		if (!Figure || !FigureElement || bNotNodeFigure) return;

		let newRange: IRangeUtils | null = null;

		if (!DOM.Element.Table.IsTable(FigureElement) && (caret.Start.Node === Figure || caret.End.Node === Figure)) {
			caret.Range.SetStartToEnd(Figure, caret.Start.Offset, caret.Start.Offset);
			newRange = caret.Range.Clone();
		}

		if (newRange) CaretUtils.UpdateRange(newRange);

		if (!DOM.HasAttr(Figure, Options.ATTRIBUTE_FOCUSED)) DOM.SetAttr(Figure, Options.ATTRIBUTE_FOCUSED);
		DOMTools.ChangePositions();
	};

	const setFocusInline = () => {
		if (DOM.HasAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING)) return;

		const caret = CaretUtils.Get();
		if (!caret) return;

		const focusableSet = self.Formatter.Formats.BlockFormatTags.Focusable;

		Arr.Each(DOM.SelectAll(Str.Join(',', ...focusableSet)), focused => DOM.RemoveAttr(focused, Options.ATTRIBUTE_FOCUSED));

		const node = FormatUtils.GetParentIfText(caret.Start.Node);

		let focusableNode: Node | null = null;

		Arr.Each(Arr.Convert(focusableSet), selector => {
			const closest = DOM.Closest(node, selector);
			if (!focusableNode) {
				focusableNode = closest;
				return;
			}

			if (closest && DOM.Utils.IsChildOf(closest, focusableNode)) focusableNode = closest;
		});

		if (focusableNode) DOM.SetAttr(focusableNode, Options.ATTRIBUTE_FOCUSED);
	};

	const listener = (): IEvent<Node[]> =>
		(paths: Node[]) => {
			DOMTools.ChangePositions();
			removeCaretPointers(paths);
			wrapFigure();
			setFocusFigure();
			setFocusInline();
		};

	self.On('Caret:Change', listener());
};

export default CaretChange;