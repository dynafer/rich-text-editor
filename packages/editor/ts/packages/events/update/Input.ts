import { NodeType } from '@dynafer/dom-control';
import { Arr, Str } from '@dynafer/utils';
import Editor from '../../Editor';
import { ICaretData } from '../../editorUtils/caret/CaretUtils';
import { BlockFormatTags } from '../../formatter/Format';
import FormatUtils from '../../formatter/FormatUtils';
import { EInputEventType, PreventEvent } from '../EventSetupUtils';
import InputUtils from './InputUtils';

const Input = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const inputUtils = InputUtils(self);

	let fakeFragment: DocumentFragment | null = null;
	let lastChildName: string | null = null;

	const runWithCaret = (callback: (caret: ICaretData | null) => void) => {
		callback(CaretUtils.Get());
		if (!fakeFragment) return;
		FormatUtils.CleanDirty(self, DOM.GetChildNodes(fakeFragment));

		let caret = CaretUtils.Get();
		const cells = DOM.Element.Table.GetSelectedCells(self);
		if (!caret && Arr.IsEmpty(cells)) return;

		const node = !caret ? cells[0] : FormatUtils.GetParentIfText(caret.Start.Node);
		if (!caret) {
			const figure = DOM.Element.Figure.FindClosest(node);
			if (!figure) return;

			caret = CaretUtils.CreateFake(figure, 0, figure, 0);
		}

		inputUtils.FinishInsertion(caret, fakeFragment);
	};

	const getAsStringCallback = (html: string) =>
		(caret: ICaretData | null) => {
			if (!caret) return;
			self.Utils.Shared.DeleteRange(caret);
			FormatUtils.CleanDirtyWithCaret(self, caret);
			fakeFragment = inputUtils.ConvertHTMLToFragment(html);
		};

	const deleteByDragEvent = (event: InputEvent) => {
		PreventEvent(event);
		const caret = CaretUtils.Get();
		if (!caret) return;

		if (!NodeType.IsText(caret.Start.Node)) {
			fakeFragment = caret.Range.Extract();
			return FormatUtils.CleanDirtyWithCaret(self, caret);
		}

		fakeFragment = inputUtils.GetProcessedFragment(caret, true);
	};

	const insertFromDropEvent = (event: InputEvent) => () => PreventEvent(event);

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
			self.Utils.Shared.DispatchCaretChange();
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