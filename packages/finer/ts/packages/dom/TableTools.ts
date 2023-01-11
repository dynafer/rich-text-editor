import { Arr, Str, Type } from '@dynafer/utils';
import Options from '../../Options';
import { ICaretData } from '../editorUtils/caret/CaretUtils';
import { ENativeEvents, PreventEvent } from '../events/EventSetupUtils';
import Editor from '../Editor';
import { TableCellSelector, TableCellSet, TableSelector } from '../formatter/Format';
import FormatUtils from '../formatter/FormatUtils';

const TableTools = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const createMovable = (table: HTMLElement): HTMLElement => {
		const movable = DOM.Create('div', {
			attrs: {
				dataMovable: '',
				draggable: 'true',
			},
			styles: {
				left: Str.Merge(table.offsetLeft.toString(), 'px'),
			},
			html: Finer.Icons.Get('Move'),
		});

		DOM.On(movable, ENativeEvents.click, () => {
			const cells = DOM.SelectAll(TableCellSelector, table);
			for (const cell of cells) {
				DOM.SetAttr(cell, Options.ATTRIBUTE_SELECTED, '');
			}

			self.Dispatch('caret:change', []);
		});

		DOM.On(movable, ENativeEvents.dragstart, (event: DragEvent) => {
			event.dataTransfer?.setData('text/html', DOM.GetOuterHTML(table));
			event.dataTransfer?.setDragImage(table, 0, 0);

			let savedCaret: ICaretData | HTMLElement[] | undefined = CaretUtils.Get()[0];
			CaretUtils.CleanRanges();

			if (!savedCaret) savedCaret = DOM.SelectAll({ tagName: [...TableCellSet], attrs: [Options.ATTRIBUTE_SELECTED] }, table);

			const cells = DOM.SelectAll(TableCellSelector, table);
			for (const cell of cells) {
				DOM.SetAttr(cell, Options.ATTRIBUTE_SELECTED, '');
			}

			const events: [Document | Element, ENativeEvents, (e: Event) => void][] = [];

			const removeEvents = () => {
				for (const removal of events) {
					DOM.Off(removal[0], removal[1], removal[2]);
				}
			};

			const resetCaret = () => {
				for (const cell of DOM.SelectAll({ tagName: [...TableCellSet], attrs: [Options.ATTRIBUTE_SELECTED] }, table)) {
					DOM.RemoveAttr(cell, Options.ATTRIBUTE_SELECTED);
				}

				if (!savedCaret) {
					const firstCell = DOM.SelectAll(TableCellSelector, table)[0];
					if (!firstCell) return;

					let firstChild: Node | null = DOM.Utils.GetFirstChild(firstCell, true);
					if (DOM.Utils.IsBr(firstChild)) firstChild = firstChild.parentNode;

					if (!firstChild) return;

					const newRange = self.Utils.Range();
					newRange.SetStartToEnd(firstChild, 0, 0);
					CaretUtils.UpdateRanges([newRange.Get()]);
					return;
				}

				if (Type.IsArray(savedCaret)) {
					for (const cell of savedCaret) {
						DOM.SetAttr(cell, Options.ATTRIBUTE_SELECTED, '');
					}

					savedCaret = undefined;
					return;
				}

				const newRange = self.Utils.Range();
				newRange.SetStart(savedCaret.Start.Node, savedCaret.Start.Offset);
				newRange.SetEnd(savedCaret.End.Node, savedCaret.End.Offset);
				CaretUtils.UpdateRanges([newRange.Get()]);
				CaretUtils.Clean();
				savedCaret = undefined;
			};

			const stopDragEvent = (e: InputEvent) => {
				PreventEvent(e);
				removeEvents();

				if (e.target === self.GetBody()) return resetCaret();

				const caret = CaretUtils.Get()[0];
				if (!caret) return resetCaret();

				const closestTable = DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node) as Element, TableSelector);
				if (closestTable === table) return resetCaret();

				const bPointLine = caret.SameRoot === caret.Start.Path[0];
				const bLineEmpty = bPointLine ? Str.IsEmpty(DOM.GetText(caret.SameRoot as HTMLElement)) : false;

				if (!!closestTable || (bPointLine && !bLineEmpty) || !DOM.Utils.IsText(caret.SameRoot) || Str.IsEmpty(caret.SameRoot.textContent) || !caret.SameRoot.parentNode) {
					DOM.InsertAfter(caret.Start.Path[0], table.parentNode);
					return resetCaret();
				}

				if (bPointLine && bLineEmpty) {
					self.GetBody().replaceChild(table.parentNode as Node, caret.SameRoot);
					return resetCaret();
				}

				let leftNode = DOM.Clone(caret.SameRoot.parentNode);
				let rightNode = DOM.Clone(caret.SameRoot.parentNode);

				const partNode = (node: Node, left: Node, right: Node, nodeCallback: () => void) => {
					let point = node.parentNode?.firstChild ?? null;
					let bRight = false;

					while (point) {
						if (point === node) {
							nodeCallback();

							point = point.nextSibling;
							bRight = true;
							continue;
						}

						if (Str.IsEmpty(DOM.Utils.IsText(point) ? point.textContent : DOM.GetText(point as HTMLElement))) {
							point = point.nextSibling;
							continue;
						}

						const target = !bRight ? left : right;
						DOM.CloneAndInsert(target, true, point);

						point = point.nextSibling;
					}
				};

				partNode(caret.SameRoot, leftNode, rightNode, () => {
					const text = caret.SameRoot.textContent ?? '';
					const leftText = text.slice(0, caret.Start.Offset);
					const rightText = text.slice(caret.Start.Offset, text.length);

					if (!Str.IsEmpty(leftText)) DOM.Insert(leftNode, DOM.CreateTextNode(leftText));
					if (!Str.IsEmpty(rightText)) DOM.Insert(rightNode, DOM.CreateTextNode(rightText));
				});

				let parent: Node | null = caret.SameRoot.parentNode;

				const partParent = (leftParent: Node, rightParent: Node) =>
					() => {
						if (!Str.IsEmpty(DOM.GetText(leftNode as HTMLElement))) DOM.Insert(leftParent, leftNode);
						if (!Str.IsEmpty(DOM.GetText(rightNode as HTMLElement))) DOM.Insert(rightParent, rightNode);
					};

				while (parent && parent.parentNode !== self.GetBody()) {
					const leftParentNode = DOM.Clone(parent.parentNode as Node);
					const rightParentNode = DOM.Clone(parent.parentNode as Node);
					const callback = partParent(leftParentNode, rightParentNode);

					partNode(parent, leftParentNode, rightParentNode, callback);

					leftNode = leftParentNode;
					rightNode = rightParentNode;
					parent = parent.parentNode;
				}

				const bEmptyLeftNode = Str.IsEmpty(DOM.GetText(leftNode as HTMLElement));
				self.GetBody().replaceChild(!bEmptyLeftNode ? leftNode : table.parentNode as Node, caret.Start.Path[0]);
				if (!bEmptyLeftNode) DOM.InsertAfter(leftNode, table.parentNode);
				if (!Str.IsEmpty(DOM.GetText(rightNode as HTMLElement))) DOM.InsertAfter(table.parentNode, rightNode);

				resetCaret();
			};

			Arr.Push(events,
				[self.GetBody(), ENativeEvents.beforeinput, stopDragEvent as (e: Event) => void],
			);

			for (const onEvent of events) {
				DOM.On(onEvent[0], onEvent[1], onEvent[2]);
			}
		});

		return movable;
	};

	const Create = (table: HTMLElement) => {
		const movable = createMovable(table);
		const tools = DOM.Create('div', {
			attrs: {
				dataType: 'table-tool',
			},
		});

		DOM.Insert(tools, movable);

		return tools;
	};

	return {
		Create,
	};
};

export default TableTools;