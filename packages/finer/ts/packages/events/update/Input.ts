import { NodeType } from '@dynafer/dom-control';
import { Arr, Str } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { BlockFormatTags, ListItemSelector } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';
import { EInputEventType, PreventEvent } from '../EventSetupUtils';
import InputUtils from './InputUtils';

const Input = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const inputUtils = InputUtils(self);
	const DOMTools = self.Tools.DOM;

	let fakeFragment: DocumentFragment | null = null;
	let lastChildName: string | null = null;

	const cleanUnusable = (fragment: DocumentFragment) => {
		const brElements = DOM.SelectAll({
			tagName: 'br',
			class: 'Apple-interchange-newline'
		}, fragment);

		Arr.Each(brElements, brElement => brElement.remove());

		const styleElements = DOM.SelectAll({
			attrs: ['style']
		}, fragment);

		Arr.Each(styleElements, styleElement => {
			const editorStyle = DOM.GetAttr(styleElement, Options.ATTRIBUTE_EDITOR_STYLE) ?? '';
			if (!Str.IsEmpty(editorStyle)) return DOM.SetStyleText(styleElement, editorStyle);
			if (DOM.Utils.GetNodeName(styleElement) !== 'span') return DOM.RemoveAttr(styleElement, 'style');
			if (!styleElement.parentNode) return;

			const children = DOM.GetChildNodes(styleElement);

			if (!Arr.IsEmpty(children)) {
				styleElement.parentNode.replaceChild(children[0], styleElement);
				return DOM.InsertAfter(children[0], ...children.slice(1, children.length));
			}

			if (!styleElement.parentElement) return;
			DOM.Remove(Str.IsEmpty(DOM.GetText(styleElement.parentElement)) ? styleElement.parentElement : styleElement);
		});
	};

	const runWithCaret = (callback: (caret: ICaretData | null) => void) => {
		callback(CaretUtils.Get());
		if (!fakeFragment) return;

		const caret = CaretUtils.Get();
		if (!caret) return;

		const newRange = self.Utils.Range();
		const lastChild = DOM.Utils.GetLastChild(fakeFragment, true);

		inputUtils.InsertFragment(caret, fakeFragment);

		if (lastChild) {
			const childName = DOM.Utils.GetNodeName(lastChild);
			if (BlockFormatTags.Figures.has(childName)) {
				const child = DOM.Element.Figure.IsFigure(lastChild) ? lastChild : lastChild.parentElement as Node;
				newRange.SetStartToEnd(child, 0, 0);
			} else {
				const offset = NodeType.IsText(lastChild) ? lastChild.length : 0;
				newRange.SetStartToEnd(lastChild, offset, offset);
			}
		}
		FormatUtils.CleanDirty(self, caret);
		CaretUtils.UpdateRange(newRange);
		fakeFragment = null;

		DOMTools.ChangePositions();
		self.Utils.Shared.DispatchCaretChange();
	};

	const getAsStringCallback = (html: string) =>
		(caret: ICaretData | null) => {
			if (!caret) return;
			caret.Range.DeleteContents();
			const fragment = DOM.Create('fragment');
			DOM.SetHTML(fragment, Str.Contains(html, '<!--StartFragment-->') ? html.split('StartFragment-->')[1].split('<!--EndFragment')[0] : html);
			fakeFragment = DOM.CreateFragment();
			DOM.Insert(fakeFragment, ...DOM.GetChildNodes(fragment, false));

			inputUtils.EditFigures(fakeFragment);
			cleanUnusable(fakeFragment);
		};

	const deleteByDragEvent = (event: InputEvent) => {
		PreventEvent(event);
		const caret = CaretUtils.Get();
		if (!caret) return;

		const escape = () => {
			fakeFragment = caret.Range.Extract();
		};

		if (caret.Start.Node !== caret.End.Node || !NodeType.IsText(caret.Start.Node)) return escape();

		const until = DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node), Str.Join(',', ...BlockFormatTags.Block))
			?? DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node), ListItemSelector);
		const startNode = caret.Start.Node.parentNode;

		if (!until || !startNode) return escape();

		const fragment = DOM.CreateFragment();

		let current: Node | null = startNode.parentNode;
		let nodeStack: Node | null = DOM.Clone(startNode);
		DOM.Insert(nodeStack, caret.Range.Extract());

		while (current && current !== until) {
			const stack = DOM.Clone(current);
			DOM.Insert(stack, nodeStack);
			nodeStack = stack;
			current = current.parentNode;
		}

		DOM.Insert(fragment, nodeStack);
		fakeFragment = fragment;
	};

	const insertFromDropEvent = (event: InputEvent) =>
		() => {
			PreventEvent(event);
			if (!fakeFragment) return;

			inputUtils.EditFigures(fakeFragment);
			cleanUnusable(fakeFragment);
		};

	const setLastChildName = () => {
		const root: Node | null = CaretUtils.Get()?.SameRoot ?? null;
		let current: Node | null = root ? FormatUtils.GetParentIfText(root) : null;
		while (current && current.parentNode !== self.GetBody()) {
			current = current.parentNode;
		}
		lastChildName = DOM.Utils.GetNodeName(current);
	};

	const processWithDataTransfer = (event: InputEvent) => {
		if (!event.dataTransfer) return;

		if (event.dataTransfer.items.length === 1) {
			PreventEvent(event);

			return event.dataTransfer.items[0].getAsString((html: string) => runWithCaret(getAsStringCallback(html)));
		}

		Arr.Each(event.dataTransfer.items, data => {
			if (!Str.Contains(data.type, 'html')) return;
			PreventEvent(event);

			data.getAsString((html: string) => runWithCaret(getAsStringCallback(html)));
		});
	};

	const processBeforeInput = (event: InputEvent) => {
		switch (event.inputType) {
			case EInputEventType.deleteByDrag:
				return deleteByDragEvent(event);
			case EInputEventType.insertFromDrop:
				return !fakeFragment ? processWithDataTransfer(event) : runWithCaret(insertFromDropEvent(event));
			case EInputEventType.insertParagraph:
				return setLastChildName();
			default:
				const inputType = Str.LowerCase(event.inputType);
				if (Str.Contains(inputType, 'delete') || Str.Contains(inputType, 'text') || !event.dataTransfer) return;

				return processWithDataTransfer(event);
		}
	};

	const processInput = (event: InputEvent) => {
		const clean = () => {
			DOMTools.ChangePositions();
			lastChildName = null;
		};

		if (event.inputType !== EInputEventType.insertParagraph || !lastChildName || !BlockFormatTags.List.has(lastChildName))
			return clean();

		const caret = CaretUtils.Get();
		if (!caret || caret.SameRoot.parentNode !== self.GetBody() || DOM.Utils.IsParagraph(caret.SameRoot))
			return clean();

		const paragraph = self.CreateEmptyParagraph();

		self.GetBody().replaceChild(paragraph, caret.SameRoot);

		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(paragraph, 0, 0);

		CaretUtils.UpdateRange(newRange);
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