import { Arr, Str } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { BlockFormatTags } from '../../formatter/Format';
import { EInputEventType, PreventEvent } from '../EventSetupUtils';

const Input = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	let fakeFragment: DocumentFragment | null = null;
	let lastChildName: string | null = null;

	const cleanUnusable = (fragment: DocumentFragment) => {
		const brElements = DOM.SelectAll({
			tagName: 'br',
			class: 'Apple-interchange-newline'
		}, fragment);
		for (const brElement of brElements) {
			brElement.remove();
		}

		const styleElements = DOM.SelectAll(DOM.Utils.CreateAttrSelector('style'), fragment);

		for (const styleElement of styleElements) {
			const editorStyle = DOM.GetAttr(styleElement, Options.ATTRIBUTE_EDITOR_STYLE) ?? '';
			if (!Str.IsEmpty(editorStyle)) {
				DOM.SetStyleText(styleElement, editorStyle);
				continue;
			}

			if (DOM.Utils.GetNodeName(styleElement) !== 'span') {
				DOM.RemoveAttr(styleElement, 'style');
				continue;
			}

			if (!styleElement.parentNode) continue;

			const children = DOM.GetChildNodes(styleElement);

			if (Arr.IsEmpty(children)) {
				if (!styleElement.parentElement) continue;

				DOM.Remove(Str.IsEmpty(DOM.GetText(styleElement.parentElement)) ? styleElement.parentElement : styleElement);
				continue;
			}

			styleElement.parentNode.replaceChild(children[0], styleElement);
			DOM.InsertAfter(children[0], ...children.slice(1, children.length));
		}
	};

	const runWithCaret = (callback: (caret: ICaretData) => void) => {
		const caret = CaretUtils.Get()[0];
		callback(caret);
		if (!fakeFragment) return;
		let lastChild = fakeFragment.lastChild;
		caret.Range.Insert(fakeFragment);
		if (lastChild) {
			while (lastChild) {
				if (!lastChild.lastChild) {
					caret.Range.SetStartAfter(lastChild);
					break;
				}
				lastChild = lastChild.lastChild;
			}
		}
		CaretUtils.UpdateRanges([caret.Range.Clone()]);
		CaretUtils.Clean();
		fakeFragment = null;
	};

	const getAsStringCallback = (html: string) =>
		(caret: ICaretData) => {
			caret.Range.DeleteContents();
			const fragment = DOM.Create('fragment');
			DOM.SetHTML(fragment, Str.Contains(html, '<!--StartFragment-->') ? html.split('StartFragment-->')[1].split('<!--EndFragment')[0] : html);
			fakeFragment = DOM.CreateFragment();
			DOM.Insert(fakeFragment, ...DOM.GetChildNodes(fragment, false));

			cleanUnusable(fakeFragment);
		};

	const deleteByDragEvent = (event: InputEvent) => {
		PreventEvent(event);
		const caret = CaretUtils.Get()[0];
		fakeFragment = caret.Range.Extract();
		CaretUtils.Clean();
		return;
	};

	const insertFromDropEvent = (event: InputEvent) =>
		() => {
			PreventEvent(event);
			if (!fakeFragment) return;

			cleanUnusable(fakeFragment);
		};

	const setLastChildName = () => {
		const root: Node = CaretUtils.Get()[0].SameRoot;
		let current: Node | null = DOM.Utils.IsText(root) ? root.parentNode : root;
		while (current && current !== self.GetBody()) {
			if (current.parentNode && current.parentNode === self.GetBody()) break;
			current = current.parentNode;
		}
		lastChildName = DOM.Utils.GetNodeName(current);
		CaretUtils.Clean();
	};

	const processWithDataTransfer = (event: InputEvent) => {
		if (!event.dataTransfer) return;

		if (event.dataTransfer.items.length === 1) {
			PreventEvent(event);

			event.dataTransfer.items[0].getAsString((html: string) => runWithCaret(getAsStringCallback(html)));
			return;
		}

		for (const data of event.dataTransfer.items) {
			if (!Str.Contains(data.type, 'html')) continue;
			PreventEvent(event);

			data.getAsString((html: string) => runWithCaret(getAsStringCallback(html)));
		}
	};

	const processBeforeInput = (event: InputEvent) => {
		switch (event.inputType) {
			case EInputEventType.deleteByDrag:
				deleteByDragEvent(event);
				return;
			case EInputEventType.insertFromDrop:
				if (!fakeFragment) return processWithDataTransfer(event);

				runWithCaret(insertFromDropEvent(event));
				return;
			case EInputEventType.insertParagraph:
				setLastChildName();
				return;
			default:
				const inputType = Str.LowerCase(event.inputType);
				if (Str.Contains(inputType, 'delete') || Str.Contains(inputType, 'text') || !event.dataTransfer) return;

				processWithDataTransfer(event);
				return;
		}
	};

	const processInput = (event: InputEvent) => {
		const clean = () => {
			lastChildName = null;
			CaretUtils.Clean();
		};

		if (event.inputType !== EInputEventType.insertParagraph || !lastChildName || !BlockFormatTags.List.has(lastChildName))
			return clean();

		const caret = CaretUtils.Get()[0];

		if (caret.SameRoot.parentNode !== self.GetBody() || DOM.Utils.IsParagraph(caret.SameRoot)) return clean();

		const paragraph = self.CreateEmptyParagraph();

		self.GetBody().replaceChild(paragraph, caret.SameRoot);

		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(paragraph, 0, 0);

		CaretUtils.UpdateRanges([newRange.Get()]);
		clean();
	};

	const GetBefore = (_editor: Editor, event: InputEvent) => processBeforeInput(event);
	const Get = (_editor: Editor, event: Event) => processInput(event as InputEvent);

	return {
		GetBefore,
		Get,
	};
};

export default Input;