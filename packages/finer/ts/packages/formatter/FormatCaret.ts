import { Str } from '@dynafer/utils';
import Editor from '../Editor';
import { ICaretData } from '../editorUtils/caret/CaretUtils';
import FormatToggle from './FormatToggle';
import { IFormatOptionBase, IToggleSetting } from './FormatType';
import { CheckFormat } from './FormatUtils';

const FormatCaret = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const toggler = FormatToggle(self);

	const getFormatToSetting = <T extends Node = ParentNode>(option: IFormatOptionBase, parent: T): IToggleSetting<T> => ({
		...option,
		parent,
		checker: CheckFormat(self, option)
	});

	const isNodeEmpty = (node: Node) =>
		(DOM.Utils.IsText(node) && Str.IsEmpty(node.textContent)) || (!DOM.Utils.IsText(node) && Str.IsEmpty(DOM.GetText(node as HTMLElement)));

	const cleanDirty = (root: Node) => {
		const firstChild = root.firstChild;
		const lastChild = root.lastChild;

		if (firstChild && isNodeEmpty(firstChild)) firstChild.remove();
		if (lastChild && isNodeEmpty(lastChild)) lastChild.remove();
	};

	const toggleSameLine = (bWrap: boolean, option: IFormatOptionBase, caret: ICaretData): Range => {
		const fragment = caret.Range.Extract();
		const setting = getFormatToSetting(option, fragment);

		toggler.ToggleOneLineRange(bWrap, setting, (parent) => {
			let children: Node[] = Array.from(parent.childNodes);
			caret.Range.Insert(parent);
			if (!bWrap) children = toggler.Unwrap.UnwrapParents(caret.SameRoot, children, setting.checker);
			cleanDirty(caret.SameRoot);
			caret.Range.SetStartBefore(children[0]);
			caret.Range.SetEndAfter(children[children.length - 1]);
		});

		return caret.Range.Clone();
	};

	const toggleRange = (bWrap: boolean, option: IFormatOptionBase, caret: ICaretData): Range => {
		const fragment = caret.Range.Extract();

		toggler.ToggleRange(bWrap, getFormatToSetting(option, fragment), (firstNodes, middleNodes, lastNodes) => {
			const lines = self.GetBody().children;
			let nextLine: Node = lines[caret.Start.Line];
			DOM.Insert(lines[caret.Start.Line], firstNodes);
			for (const node of middleNodes) {
				DOM.InsertAfter(nextLine, node);
				nextLine = node;
			}
			lines[caret.End.Line].replaceChildren(...lastNodes, ...Array.from(lines[caret.End.Line].childNodes));
			for (let lineNum = caret.Start.Line, endLine = caret.End.Line; lineNum <= endLine; ++ lineNum) {
				cleanDirty(lines[lineNum]);
			}
			caret.Range.SetStart(firstNodes[0], 0);
			caret.Range.SetEndAfter(lastNodes[lastNodes.length - 1]);
		});

		return caret.Range.Clone();
	};

	const toggleCaret = (bWrap: boolean, option: IFormatOptionBase, caret: ICaretData): Range => {
		const caretId = DOM.Utils.CreateUEID('caret', false);

		const caretPointer = DOM.Create('span', {
			attrs: {
				id: caretId,
				caret: 'true'
			}
		});

		const wrappingOption = toggler.GetWrappingOption(option.type, option.format, option.formatValue);

		const createWrapper = DOM.Create(wrappingOption.format, {
			...wrappingOption.option,
			html: DOM.Utils.GetEmptyString()
		});

		DOM.Insert(caretPointer, bWrap ? createWrapper : '&nbsp;');
		caret.Range.Insert(caretPointer);

		if (bWrap) {
			caret.Range.SetStartToEnd(createWrapper, 1, 1);
		} else {
			caret.Range.SelectContents(caretPointer);
			toggler.Unwrap.UnwrapParents(caret.SameRoot, [caretPointer], CheckFormat(self, option));
			DOM.SetHTML(caretPointer, DOM.Utils.GetEmptyString());
			caret.Range.SetStartToEnd(caretPointer, 1, 1);
		}

		return caret.Range.Clone();
	};

	const Toggle = (bWrap: boolean, option: IFormatOptionBase) => {
		const carets: ICaretData[] = CaretUtils.Get(true);
		const newRanges: Range[] = [];

		for (let index = 0, length = carets.length; index < length; ++ index) {
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
	};

	return {
		Toggle
	};
};

export default FormatCaret;