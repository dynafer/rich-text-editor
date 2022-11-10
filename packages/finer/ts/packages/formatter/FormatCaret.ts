import Editor from '../Editor';
import { ICaretData } from '../editorUtils/CaretUtils';
import FormatToggle from './FormatToggle';
import { EFormatType, IFormatOptionBase, IToggleSetting } from './FormatType';
import { CheckFormat } from './FormatUtils';

const FormatCaret = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const toggler = FormatToggle(self);

	const getFormatToSetting = <T extends Node = ParentNode>(option: IFormatOptionBase, parent: T): IToggleSetting<T> => {
		return {
			...option,
			parent,
			checker: CheckFormat(self, option)
		};
	};

	const toggleSameLine = (bWrap: boolean, option: IFormatOptionBase, caret: ICaretData): Range => {
		const fragment = caret.Range.extractContents();
		const setting = getFormatToSetting(option, fragment);

		toggler.ToggleOneLineRange(bWrap, setting, (parent) => {
			let children: Node[] = Array.from(parent.childNodes);
			caret.Range.insertNode(parent);
			if (!bWrap) children = toggler.Unwrap.UnwrapParents(caret.SameRoot, children, setting.checker);
			caret.Range.setStartBefore(children[0]);
			caret.Range.setEndAfter(children[children.length - 1]);
		});

		return caret.Range.cloneRange();
	};

	const toggleRange = (bWrap: boolean, option: IFormatOptionBase, caret: ICaretData): Range => {
		const fragment = caret.Range.extractContents();

		toggler.ToggleRange(bWrap, getFormatToSetting(option, fragment), (firstNodes, middleNodes, lastNodes) => {
			const lines = self.GetBody().children;
			let nextLine: Node = lines[caret.Start.Line];
			DOM.Insert(lines[caret.Start.Line], firstNodes);
			for (const node of middleNodes) {
				DOM.InsertAfter(nextLine, node);
				nextLine = node;
			}
			lines[caret.End.Line].replaceChildren(...lastNodes, ...Array.from(lines[caret.End.Line].childNodes));
			caret.Range.setStart(firstNodes[0], 0);
			caret.Range.setEndAfter(lastNodes[lastNodes.length - 1]);
		});

		return caret.Range.cloneRange();
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
		caret.Range.insertNode(caretPointer);

		if (bWrap) {
			caret.Range.setStart(createWrapper, 1);
			caret.Range.setEnd(createWrapper, 1);
		} else {
			caret.Range.selectNodeContents(caretPointer);
			toggler.Unwrap.UnwrapParents(caret.SameRoot, [caretPointer], CheckFormat(self, option));
			DOM.SetHTML(caretPointer, DOM.Utils.GetEmptyString());
			caret.Range.setStart(caretPointer, 1);
			caret.Range.setEnd(caretPointer, 1);
		}

		return caret.Range.cloneRange();
	};

	const toggle = (bWrap: boolean, option: IFormatOptionBase) => {
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

	const Toggle = (bWrap: boolean, option: IFormatOptionBase) => {
		switch (option.type) {
			case EFormatType.TAG:
				toggle(bWrap, option);
				break;
			case EFormatType.STYLE:
				toggle(bWrap, option);
				break;
			default:
				break;
		}
	};

	return {
		Toggle
	};
};

export default FormatCaret;