import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { IInlineFormat } from '../FormatType';
import FormatUtils from '../FormatUtils';

export interface IToggleInline {
	ToggleFromCaret: (bWrap: boolean, value?: string) => void,
}

const ToggleInline = (editor: Editor, formats: IInlineFormat | IInlineFormat[]): IToggleInline => {
	const self = editor;
	const DOM = self.DOM;
	const Toggler = self.Formatter.Toggler;
	const CaretUtils = self.Utils.Caret;

	const isNodeEmpty = (node: Node) =>
		(DOM.Utils.IsText(node) && Str.IsEmpty(node.textContent)) || (!DOM.Utils.IsText(node) && Str.IsEmpty(DOM.GetText(node as HTMLElement)));

	const cleanDirty = (root: Node) => {
		const children = DOM.GetChildNodes(root);
		for (const child of children) {
			if (!child || !isNodeEmpty(child)) continue;

			if (DOM.Utils.IsText(child)) child.remove();
			else DOM.Remove(child as Element, false);
		}
	};

	const hasFormat = (parent: Node, value?: string): boolean => {
		const checkFormat = (format: IInlineFormat): boolean => {
			const { Tag, Styles } = format;
			if (!Styles && DOM.Closest(parent as Element, Tag)) return true;
			if (!!Styles) {
				const selector = FormatUtils.GetStyleSelectorMap(Styles, value);
				if (DOM.ClosestByStyle(parent as Element, selector)) return true;
			}
			return false;
		};

		if (!Type.IsArray(formats)) return checkFormat(formats);

		for (const format of formats) {
			if (checkFormat(format)) return true;
		}

		return false;
	};

	const processInSameNode = (bWrap: boolean, caret: ICaretData, value?: string) => {
		if (!caret.IsRange() || caret.Start.Node !== caret.End.Node) return;

		const node = caret.Start.Node;
		const parent = FormatUtils.GetParentIfText(node);

		const bFormat = hasFormat(parent, value);
		if ((bWrap && bFormat) || (!bWrap && !bFormat)) return;

		const splitedTextNode = FormatUtils.SplitTextNode(self, node, caret.Start.Offset, caret.End.Offset);
		if (!splitedTextNode) return;

		caret.Range.SetStartToEnd(splitedTextNode, 0, (splitedTextNode as Text).length);

		Toggler.Toggle(bWrap, formats, splitedTextNode, value);
	};

	const trimRangeEdge = (bWrap: boolean, node: Node, offset: number, value?: string, bPrevious: boolean = false): Node => {
		const parent = FormatUtils.GetParentIfText(node);

		const bFormat = hasFormat(parent, value);
		if ((bWrap && bFormat) || (!bWrap && !bFormat)) return node;

		const text = node.textContent;
		if (!text) return node;

		const splitedTextNode = FormatUtils.SplitTextNode(self, node,
			bPrevious ? offset : 0,
			bPrevious ? text.length : offset
		);
		if (!splitedTextNode) return node;

		return splitedTextNode;
	};

	const processRange = (bWrap: boolean, caret: ICaretData, value?: string) => {
		if (!caret.IsRange() || caret.Start.Node === caret.End.Node) return;

		const startNode = trimRangeEdge(bWrap, caret.Start.Node, caret.Start.Offset, value, true);
		const endNode = trimRangeEdge(bWrap, caret.End.Node, caret.End.Offset, value);

		caret.Range.SetStart(startNode, startNode === caret.Start.Node ? caret.Start.Offset : 0);
		caret.Range.SetEnd(endNode, endNode === caret.End.Node ? caret.End.Offset : (endNode.textContent?.length ?? 0));

		const toggleOption = {
			except: Arr.MergeUnique(
				FormatUtils.ExceptNodes(self, startNode, caret.SameRoot, true),
				FormatUtils.ExceptNodes(self, endNode, caret.SameRoot)
			),
			endNode,
			value,
		};

		Toggler.ToggleRecursive(bWrap, formats, caret.SameRoot, toggleOption);
	};

	const cleanExistedCaret = (caret: ICaretData) => {
		const node = caret.Start.Node;
		const offset = caret.Start.Offset;
		const existedCaret = DOM.Closest(FormatUtils.GetParentIfText(node) as Element, DOM.Utils.CreateAttrSelector('caret'));

		if (!existedCaret) return;

		const fragment = DOM.CreateFragment();
		for (const child of DOM.GetChildNodes(existedCaret, false)) {
			if (DOM.Utils.IsText(child) ? DOM.Utils.IsTextEmpty(child) : Str.IsEmpty(DOM.GetText(child as HTMLElement))) continue;
			fragment.append(child);
		}

		if (Arr.IsEmpty(DOM.GetChildNodes(fragment))) {
			caret.Range.SetEndAfter(existedCaret);
			existedCaret.remove();
			return;
		}

		existedCaret.parentNode?.replaceChild(fragment, existedCaret);
		caret.Range.SetStartToEnd(node, offset, offset);
	};

	const processCaret = (bWrap: boolean, caret: ICaretData, value?: string) => {
		if (caret.IsRange() || caret.Start.Node !== caret.End.Node || caret.Start.Offset !== caret.End.Offset) return;
		cleanExistedCaret(caret);

		const caretId = DOM.Utils.CreateUEID('caret');

		const caretSpliter = DOM.Create('span', {
			attrs: {
				id: caretId,
				caret: 'true',
			},
		});

		if (!bWrap) {
			DOM.Insert(caretSpliter, DOM.Utils.GetEmptyString());
			caret.Range.Insert(caretSpliter);
			caret.Range.SetStartToEnd(caretSpliter, 1, 1);
			const child = DOM.GetChildNodes(caretSpliter, false)[0];
			Toggler.Toggle(false, formats, child, value);
			return;
		}

		const { Tag, Styles } = Type.IsArray(formats) ? formats[0] : formats;

		const createOption: Record<string, string | Record<string, string>> = {
			html: DOM.Utils.GetEmptyString(),
		};

		if (!!Styles) {
			createOption.styles = {};
			for (const [styleName, styleValue] of Object.entries(Styles)) {
				if (!value && styleValue === '{{value}}') continue;
				createOption.styles[styleName] = styleValue.replace('{{value}}', value ?? '');
			}
		}

		const wrapped = DOM.Create(Tag, createOption);

		DOM.Insert(caretSpliter, wrapped);
		caret.Range.Insert(caretSpliter);
		caret.Range.SetStartToEnd(bWrap ? wrapped : caretSpliter, 1, 1);
	};

	const ToggleFromCaret = (bWrap: boolean, value?: string) => {
		self.Focus();

		for (const caret of CaretUtils.Get()) {
			processInSameNode(bWrap, caret, value);
			processRange(bWrap, caret, value);
			processCaret(bWrap, caret, value);
			cleanDirty(caret.SameRoot);
		}

		CaretUtils.Clean();
	};

	return {
		ToggleFromCaret,
	};
};

export default ToggleInline;