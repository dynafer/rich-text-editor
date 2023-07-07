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
	const PartsTool = self.Tools.Parts;

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

		Arr.WhileShift(figureElements, element => {
			if (DOM.Element.Figure.Is(element)) return;

			const currentFigure = DOM.Element.Figure.FindClosest(element);

			const figureType = DOM.Element.Figure.FindType(DOM.Utils.GetNodeName(element));
			const figure = currentFigure ?? DOM.Element.Figure.Create(figureType);

			if (!currentFigure) {
				DOM.InsertAfter(element, figure);
				DOM.Insert(figure, element);
			}

			if (!!PartsTool.Manager.SelectParts(false, figure)) return;

			const parts = PartsTool.Create(figureType, element);
			DOM.Insert(figure, parts);
		});
	};

	const setFocusFigure = () => {
		if (self.IsAdjusting()) return;

		const caret = CaretUtils.Get();
		if (!caret) return;

		const node = FormatUtils.GetParentIfText(caret.Start.Node);

		const { Figure, FigureElement } = DOM.Element.Figure.Find(node);

		PartsTool.UnsetAllFocused(Figure);

		const bNotNodeFigure = !!Figure && !!caret?.IsRange() && DOM.Element.Figure.FindClosest(node) !== Figure;
		if (!Figure || !FigureElement || bNotNodeFigure) return;

		let newRange: IRangeUtils | null = null;

		if (!DOM.Element.Table.Is(FigureElement) && (caret.Start.Node === Figure || caret.End.Node === Figure)) {
			caret.Range.SetStartToEnd(Figure, caret.Start.Offset, caret.Start.Offset);
			newRange = caret.Range.Clone();
		}

		if (newRange) CaretUtils.UpdateRange(newRange);

		if (!DOM.HasAttr(Figure, Options.ATTRIBUTES.FOCUSED)) DOM.SetAttr(Figure, Options.ATTRIBUTES.FOCUSED);
		PartsTool.ChangePositions();
	};

	const setFocusInline = () => {
		if (self.IsAdjusting()) return;

		const caret = CaretUtils.Get();
		if (!caret) return;

		const focusableSet = BlockFormatTags.Focusable;

		Arr.Each(DOM.SelectAll(Str.Join(',', ...focusableSet)), focused => DOM.RemoveAttr(focused, Options.ATTRIBUTES.FOCUSED));

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

		if (focusableNode) DOM.SetAttr(focusableNode, Options.ATTRIBUTES.FOCUSED);
	};

	const listener = (): IEvent<Node[]> =>
		(paths: Node[]) => {
			PartsTool.ChangePositions();
			removeCaretPointers(paths);
			wrapFigure();
			setFocusFigure();
			setFocusInline();
		};

	self.On('Caret:Change', listener());
};

export default CaretChange;