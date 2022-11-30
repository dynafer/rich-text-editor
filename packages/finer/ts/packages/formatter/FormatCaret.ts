import { Str } from '@dynafer/utils';
import Editor from '../Editor';
import { ICaretData } from '../editorUtils/caret/CaretUtils';
import FormatToggle from './FormatToggle';
import { IFormatOptionBase, IToggleSetting } from './FormatType';
import { CheckFormat, FindClosest } from './FormatUtils';

const FormatCaret = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const toggler = FormatToggle(self);

	const convertFormatToSetting = <T extends Node = ParentNode>(option: IFormatOptionBase, parent: T): IToggleSetting<T> => ({
		...option,
		Parent: parent,
		Checker: CheckFormat(self, option)
	});

	const isNodeEmpty = (node: Node) =>
		(DOM.Utils.IsText(node) && Str.IsEmpty(node.textContent)) || (!DOM.Utils.IsText(node) && Str.IsEmpty(DOM.GetText(node as HTMLElement)));

	const cleanDirty = (root: Node) => {
		const children = Array.from(root.childNodes);
		for (const child of children) {
			if (!child || !isNodeEmpty(child)) continue;

			if (DOM.Utils.IsText(child)) child.remove();
			else DOM.Remove(child as Element, false);
		}
	};

	const toggleSameLine = (bWrap: boolean, option: IFormatOptionBase, caret: ICaretData): Range => {
		const fragment = caret.Range.Extract();
		const setting = convertFormatToSetting(option, fragment);

		toggler.ToggleOneLineRange(bWrap, setting, (parent) => {
			let children: Node[] = Array.from(parent.childNodes);
			caret.Range.Insert(parent);
			if (!bWrap && !!FindClosest(self, option, DOM.Utils.IsText(caret.SameRoot) ? caret.SameRoot.parentNode : caret.SameRoot))
				children = toggler.Unwrap.UnwrapParents(caret.SameRoot, children, setting.Checker);
			cleanDirty(caret.SameRoot);
			caret.Range.SetStartBefore(children[0]);
			caret.Range.SetEndAfter(children[children.length - 1]);
		});

		return caret.Range.Clone();
	};

	const toggleRange = (bWrap: boolean, option: IFormatOptionBase, caret: ICaretData): Range => {
		const fragment = caret.Range.Extract();

		toggler.ToggleRange(bWrap, convertFormatToSetting(option, fragment), (firstNodes, middleNodes, lastNodes) => {
			const lines = self.GetBody().children;
			let nextLine: Node = lines[caret.Start.Line];
			DOM.Insert(lines[caret.Start.Line], firstNodes);
			for (const node of middleNodes) {
				DOM.InsertAfter(nextLine, node);
				nextLine = node;
			}
			lines[caret.End.Line].replaceChildren(...lastNodes, ...Array.from(lines[caret.End.Line].childNodes));
			for (let lineNum = caret.Start.Line, endLine = caret.End.Line; lineNum <= endLine; ++lineNum) {
				cleanDirty(lines[lineNum]);
			}
			caret.Range.SetStart(firstNodes[0], 0);
			caret.Range.SetEndAfter(lastNodes[lastNodes.length - 1]);
		});

		return caret.Range.Clone();
	};

	const toggleCaret = (bWrap: boolean, option: IFormatOptionBase, caret: ICaretData): Range => {
		const { Type, Format, FormatValue } = option;
		const caretId = DOM.Utils.CreateUEID('caret', false);

		const caretPointer = DOM.Create('span', {
			attrs: {
				id: caretId,
				caret: 'true'
			}
		});

		const wrappingOption = toggler.GetFormattingOption(Type, Format, FormatValue);

		const createWrapper = DOM.Create(wrappingOption.Format, {
			...wrappingOption.Option,
			html: DOM.Utils.GetEmptyString()
		});

		DOM.Insert(caretPointer, bWrap ? createWrapper : '&nbsp;');
		caret.Range.Insert(caretPointer);

		if (!bWrap) {
			caret.Range.SelectContents(caretPointer);
			toggler.Unwrap.UnwrapParents(caret.SameRoot, [caretPointer], CheckFormat(self, option));
			DOM.SetHTML(caretPointer, DOM.Utils.GetEmptyString());
		}

		caret.Range.SetStartToEnd(bWrap ? createWrapper : caretPointer, 1, 1);

		return caret.Range.Clone();
	};

	const Toggle = (bWrap: boolean, option: IFormatOptionBase) => {
		const carets: ICaretData[] = CaretUtils.Get(true);
		const newRanges: Range[] = [];

		for (let index = 0, length = carets.length; index < length; ++index) {
			const caret = carets[index];

			if (caret.IsRange() || carets.length > 1) {
				const toggleLines = caret.IsSameLine() ? toggleSameLine : toggleRange;
				newRanges.push(toggleLines(bWrap, option, caret));
				continue;
			} else {
				newRanges.push(toggleCaret(bWrap, option, caret));
			}
		}

		CaretUtils.UpdateRanges(newRanges);
		CaretUtils.Clean();
	};

	return {
		Toggle
	};
};

export default FormatCaret;