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

	const isNodeEmpty = (node: Node) =>
		(DOM.Utils.IsText(node) && Str.IsEmpty(node.textContent)) || (!DOM.Utils.IsText(node) && Str.IsEmpty(DOM.GetText(node as HTMLElement)));

	const cleanDirty = (caret: ICaretData) => {
		const children = DOM.GetChildNodes(caret.SameRoot);
		for (const child of children) {
			if (!child || !isNodeEmpty(child) || DOM.HasAttr(child, 'caret') || DOM.HasAttr(child, 'marker')) continue;

			if (DOM.Utils.IsText(child)) child.remove();
			else DOM.Remove(child as Element, false);
		}
	};

	const hasFormat = (node: Node, value?: string): boolean => {
		const checkFormat = (format: IInlineFormat): boolean => {
			const { Tag, Styles } = format;
			if (!Styles && DOM.Closest(node as Element, Tag)) return true;
			if (!!Styles) {
				const selector = FormatUtils.GetStyleSelectorMap(Styles, value);
				if (DOM.ClosestByStyle(node as Element, selector)) return true;
			}
			return false;
		};

		if (!Type.IsArray(formats)) return checkFormat(formats);

		for (const format of formats) {
			if (checkFormat(format)) return true;
		}

		return false;
	};

	const tableProcessor = (bWrap: boolean, value?: string): boolean => {
		const cells = FormatUtils.GetTableItems(self, true);
		if (cells.length === 0) return false;

		for (const cell of cells) {
			Toggler.ToggleRecursive(bWrap, formats, cell, { value });
		}

		return true;
	};

	const sameNodeProcessor = (bWrap: boolean, caret: ICaretData, value?: string): boolean => {
		if (!caret.IsRange() || caret.Start.Node !== caret.End.Node) return false;

		const node = caret.Start.Node;

		const bFormat = hasFormat(FormatUtils.GetParentIfText(node), value);
		if ((bWrap && bFormat) || (!bWrap && !bFormat)) return false;

		const splitedTextNode = FormatUtils.SplitTextNode(self, node, caret.Start.Offset, caret.End.Offset);
		if (!splitedTextNode) return false;

		caret.Range.SetStartToEnd(splitedTextNode, 0, (splitedTextNode as Text).length);

		Toggler.Toggle(bWrap, formats, splitedTextNode, value);

		return true;
	};

	const trimRangeEdge = (bWrap: boolean, node: Node, offset: number, value?: string, bPrevious: boolean = false): Node => {
		const element = FormatUtils.GetParentIfText(node);

		const bFormat = hasFormat(element, value);
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

	const rangeProcessor = (bWrap: boolean, caret: ICaretData, value?: string): boolean => {
		if (!caret.IsRange() || caret.Start.Node === caret.End.Node) return false;

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

		return true;
	};

	const cleanExistedCaret = (caret: ICaretData) => {
		const node = caret.Start.Node;
		const offset = caret.Start.Offset;
		const existedCaret = DOM.Closest(FormatUtils.GetParentIfText(node) as Element, DOM.Utils.CreateAttrSelector('caret'));

		if (!existedCaret) return;

		const fragment = DOM.CreateFragment();
		for (const child of DOM.GetChildNodes(existedCaret, false)) {
			const bEmpty = DOM.Utils.IsText(child) ? DOM.Utils.IsTextEmpty(child) : Str.IsEmpty(DOM.GetText(child as HTMLElement));
			const bMakrer = !DOM.Utils.IsText(child) && DOM.HasAttr(child, 'marker');
			if (bEmpty && !DOM.Utils.IsBr(child) && !bMakrer) continue;
			DOM.Insert(fragment, child);
		}

		if (Arr.IsEmpty(DOM.GetChildNodes(fragment))) {
			caret.Range.SetEndAfter(existedCaret);
			existedCaret.remove();
			return;
		}

		existedCaret.parentNode?.replaceChild(fragment, existedCaret);
		caret.Range.SetStartToEnd(node, offset, offset);
	};

	const caretProcessor = (bWrap: boolean, caret: ICaretData, value?: string): boolean => {
		if (caret.IsRange() || caret.Start.Node !== caret.End.Node || caret.Start.Offset !== caret.End.Offset) return false;
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
			return true;
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
		caret.Range.SetStartToEnd(wrapped, 1, 1);

		return true;
	};

	const ToggleFromCaret = (bWrap: boolean, value?: string) =>
		FormatUtils.SerialiseWithProcessors(self, {
			bWrap,
			value,
			tableProcessor,
			processors: [
				{ processor: caretProcessor },
				{ processor: sameNodeProcessor },
				{ processor: rangeProcessor },
			],
			afterProcessors: cleanDirty
		});

	return {
		ToggleFromCaret,
	};
};

export default ToggleInline;