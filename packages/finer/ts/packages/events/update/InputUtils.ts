import { NodeType } from '@dynafer/dom-control';
import { Arr, Str } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { AllBlockFormats, BlockFormatTags, FigureElementFormats, ListItemSelector, ListSelector } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';

const InputUtils = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const EditFigures = (fragment: DocumentFragment) => {
		const figures = DOM.SelectAll<HTMLElement>({
			tagName: DOM.Element.Figure.Selector
		}, fragment);

		Arr.WhileShift(figures, figure => {
			const figureType = DOM.GetAttr(figure, 'type');
			if (!figureType || !DOM.Element.Figure.HasType(figureType)) DOM.Remove(figure);
		});

		const figureElements = DOM.SelectAll<HTMLElement>({
			tagName: Arr.Convert(FigureElementFormats)
		}, fragment);

		Arr.WhileShift(figureElements, element => {
			if (DOM.Element.Table.Is(element)) {
				const columnGroups = DOM.SelectAll('colgroup', element);
				Arr.WhileShift(columnGroups, columnGroup => DOM.Remove(columnGroup));
				DOM.SetAttrs(element, {
					contenteditable: 'true',
					border: '1'
				});

				const widthColumns = DOM.SelectAll({
					attrs: ['width']
				}, element);
				Arr.WhileShift(widthColumns, widthColumn => {
					DOM.SetStyle(widthColumn, 'width', `${DOM.GetAttr(widthColumn, 'width')}px`);
					DOM.RemoveAttr(widthColumn, 'width');
				});

				const heightColumns = DOM.SelectAll({
					attrs: ['width']
				}, element);
				Arr.WhileShift(heightColumns, heightColumn => {
					DOM.SetStyle(heightColumn, 'height', `${DOM.GetAttr(heightColumn, 'height')}px`);
					DOM.RemoveAttr(heightColumn, 'height');
				});

				DOM.RemoveAttrs(element, 'width', 'height');
			}
			if (!!DOM.Element.Figure.FindClosest(element)) return;

			const figure = DOM.Element.Figure.Create(DOM.Utils.GetNodeName(element));
			DOM.CloneAndInsert(figure, true, element);

			element.parentNode?.replaceChild(figure, element);
		});
	};

	const CleanUnusable = (fragment: DocumentFragment) => {
		const brElements = DOM.SelectAll({
			tagName: 'br',
			class: 'Apple-interchange-newline'
		}, fragment);

		Arr.Each(brElements, brElement => DOM.Remove(brElement));

		const styleElements = DOM.SelectAll({
			attrs: ['style']
		}, fragment);

		Arr.Each(styleElements, styleElement => {
			const editorStyle = DOM.GetAttr(styleElement, Options.ATTRIBUTE_EDITOR_STYLE) ?? '';
			const elementName = DOM.Utils.GetNodeName(styleElement);
			if (!Str.IsEmpty(editorStyle)) return DOM.SetStyleText(styleElement, editorStyle);
			if (!DOM.Utils.IsSpan(styleElement)) return DOM.RemoveAttr(styleElement, 'style');

			const parent = styleElement.parentNode;
			if (BlockFormatTags.Figures.has(elementName) || !parent) return;

			const children = DOM.GetChildNodes(styleElement);

			if (!Arr.IsEmpty(children)) {
				parent.replaceChild(children[0], styleElement);
				return DOM.InsertAfter(children[0], ...children.slice(1, children.length));
			}

			DOM.Remove(Str.IsEmpty(DOM.GetText(parent)) ? parent : styleElement);
		});

		EditFigures(fragment);
	};

	const insertBlocks = (caret: ICaretData, fragment: DocumentFragment): Node => {
		const nodes = DOM.GetChildNodes(fragment);

		const { EndBlock } = self.Utils.Shared.SplitLines(caret.Start.Node, caret.Start.Offset);

		const startParent = FormatUtils.GetParentIfText(caret.Start.Node);
		const blockSelectors = Str.Join(',', ...BlockFormatTags.Block);

		let bFirst = true;
		let previousBlock: Node = startParent;
		Arr.WhileShift(nodes, node => {
			const blockName = DOM.Utils.GetNodeName(node);

			if (bFirst) {
				bFirst = false;
				if (BlockFormatTags.Block.has(blockName)) {
					const startBlock = DOM.Closest(startParent, blockSelectors) ?? DOM.Closest(startParent, ListItemSelector);
					if (startBlock) {
						previousBlock = startBlock;
						return DOM.Insert(startBlock, ...DOM.GetChildNodes(node));
					}
				}

				if (DOM.Element.Figure.Is(startParent) && !DOM.Element.Table.Is(DOM.Element.Figure.SelectFigureElement(startParent))) {
					previousBlock = node;
					return DOM.InsertAfter(startParent, node);
				}
			}

			if (BlockFormatTags.Figures.has(blockName)) {
				const previous = DOM.Closest(previousBlock, ListSelector)
					?? DOM.Closest(previousBlock, blockSelectors)
					?? previousBlock;

				previousBlock = node;
				const insert = !!previous ? DOM.InsertAfter : DOM.Insert;
				return insert(previous ?? self.GetBody(), node);
			}

			if (BlockFormatTags.List.has(blockName)) {
				const previousList = DOM.Closest(previousBlock, ListSelector);
				if (previousList && blockName === DOM.Utils.GetNodeName(previousList)) {
					previousBlock = previousList;
					return DOM.Insert(previousList, ...DOM.GetChildNodes(node));
				}
			}

			DOM.InsertAfter(previousBlock, node);
			previousBlock = node;
		});

		const previousName = DOM.Utils.GetNodeName(previousBlock);

		const endBlock = EndBlock ?? previousBlock.nextSibling;
		const endBlockName = DOM.Utils.GetNodeName(endBlock);

		if (previousName === endBlockName && BlockFormatTags.List.has(previousName) && BlockFormatTags.List.has(endBlockName)) {
			const lastChild = DOM.Utils.GetLastChild(previousBlock);
			Arr.WhileShift(DOM.GetChildNodes(endBlock), listItem => {
				if (Str.IsEmpty(DOM.GetText(listItem))) return DOM.Remove(listItem);
				DOM.Insert(previousBlock, listItem);
			});
			DOM.Remove(endBlock);
			return lastChild as Element;
		}

		const insert = !!previousBlock ? DOM.InsertAfter : DOM.Insert;
		insert(previousBlock ?? self.GetBody(), endBlock);
		return previousBlock;
	};

	const insertInlines = (caret: ICaretData, fragment: DocumentFragment): Node | null => {
		const firstChild = DOM.Utils.GetFirstChild(fragment);
		const lastChild = DOM.Utils.GetLastChild(fragment);

		const lastChildForCaret = DOM.Utils.GetLastChild(fragment, true);
		caret.Range.Insert(fragment);

		if (firstChild?.parentElement !== self.GetBody() && lastChild?.parentElement !== self.GetBody())
			return lastChildForCaret;

		const targetInsert = firstChild?.previousSibling ?? lastChild?.nextSibling ?? self.GetBody();
		const insert = targetInsert === lastChild?.nextSibling
			? DOM.InsertBefore
			: (targetInsert === firstChild?.previousSibling
				? DOM.InsertAfter
				: DOM.Insert);

		const paragraph = self.CreateEmptyParagraph();
		DOM.Remove(DOM.Utils.GetFirstChild(paragraph));
		let node = firstChild;
		while (node) {
			const nextSibling = node.nextSibling;
			DOM.Insert(paragraph, node);
			if (node === lastChild) break;
			node = nextSibling;
		}

		insert(targetInsert, paragraph);
		return lastChildForCaret;
	};

	const InsertFragment = (caret: ICaretData, fragment: DocumentFragment): Node | null => {
		const blockElements = DOM.SelectAll({
			tagName: Arr.Convert(AllBlockFormats)
		}, fragment);

		if (Arr.IsEmpty(blockElements)) return insertInlines(caret, fragment);

		Arr.Clean(blockElements);
		return DOM.Utils.GetLastChild(insertBlocks(caret, fragment), true);
	};

	const GetProcessedFragment = (caret: ICaretData, bExtract: boolean): DocumentFragment => {
		const extractOrClone = (): DocumentFragment => {
			if (!bExtract) return caret.Range.CloneContents();
			const fragment = caret.Range.Extract();
			FormatUtils.CleanDirtyWithCaret(self, caret);
			return fragment;
		};

		let fragment: DocumentFragment;
		if (caret.Start.Node !== caret.End.Node) {
			const closestAnchor = DOM.Closest(FormatUtils.GetParentIfText(caret.SameRoot), 'a');
			if (caret.SameRoot === self.GetBody() || !closestAnchor) return extractOrClone();
			fragment = extractOrClone();
			const clonedAnchor = DOM.Clone(closestAnchor);
			DOM.Insert(clonedAnchor, ...DOM.GetChildNodes(fragment));
			DOM.Insert(fragment, clonedAnchor);
			return fragment;
		}

		const until = DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node), { tagName: Arr.Convert(BlockFormatTags.Block) })
			?? DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node), ListItemSelector);
		const startNode = caret.Start.Node.parentNode;

		if (!until || !startNode) return extractOrClone();

		fragment = DOM.CreateFragment();

		let current: Node | null = startNode.parentNode;
		let nodeStack: Node | null = DOM.Clone(startNode);
		DOM.Insert(nodeStack, extractOrClone());

		while (current && current !== until) {
			const stack = DOM.Clone(current);
			DOM.Insert(stack, nodeStack);
			nodeStack = stack;
			current = current.parentNode;
		}

		DOM.Insert(fragment, nodeStack);
		return fragment;
	};

	const escapeUselessTags = (html: string): string =>
		DOM.Utils.EscapeComments(html)
			.replace(/<\/?html.*?>/gs, '')
			.replace(/<\/?head.*?>/gs, '')
			.replace(/<\/?body.*?>/gs, '')
			.replace(/(\r\n|\n|\r)/gm, '');

	const ConvertHTMLToFragment = (html: string): DocumentFragment => {
		const fakeFragment = DOM.Create('fragment');
		DOM.SetHTML(fakeFragment, escapeUselessTags(html));
		const fragment = DOM.CreateFragment();
		DOM.Insert(fragment, ...DOM.GetChildNodes(fakeFragment, false));
		DOM.Remove(fakeFragment);
		return fragment;
	};

	const FinishInsertion = (caret: ICaretData, fragment: DocumentFragment) => {
		CleanUnusable(fragment);

		const newRange = self.Utils.Range();

		const nodes = DOM.GetChildNodes(fragment);

		self.Dispatch('Nodes:Insert:Before', nodes);
		const lastChild = InsertFragment(caret, fragment);

		if (lastChild) {
			const childName = DOM.Utils.GetNodeName(lastChild);
			if (BlockFormatTags.Figures.has(childName)) {
				const child = DOM.Element.Figure.Is(lastChild) ? lastChild : lastChild.parentElement as Node;
				newRange.SetStartToEnd(child, 0, 0);
			} else {
				const offset = NodeType.IsText(lastChild) ? lastChild.length : 0;
				newRange.SetStartToEnd(lastChild, offset, offset);
			}

			self.Scroll(FormatUtils.GetParentIfText(lastChild) as HTMLElement);
		}

		FormatUtils.CleanDirtyWithCaret(self, caret);
		CaretUtils.UpdateRange(newRange);

		self.Utils.Shared.DispatchCaretChange();

		self.Dispatch('Nodes:Insert:After', nodes);
	};

	return {
		EditFigures,
		CleanUnusable,
		InsertFragment,
		GetProcessedFragment,
		ConvertHTMLToFragment,
		FinishInsertion,
	};
};

export default InputUtils;