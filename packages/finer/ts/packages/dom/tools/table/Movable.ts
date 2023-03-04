import { Str } from '@dynafer/utils';
import Options from '../../../../Options';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import { TableCellSelector, TableSelector } from '../../../formatter/Format';
import FormatUtils from '../../../formatter/FormatUtils';
import { CreateCurrentPoint, CreateMovableHorizontalSize, MoveToCurrentPoint } from './TableToolsUtils';

const Movable = (editor: Editor, table: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const movable = DOM.Create('div', {
		attrs: {
			dataMovable: '',
			draggable: 'true',
			title: 'Move a table',
		},
		styles: {
			left: CreateMovableHorizontalSize(table.offsetLeft, true),
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

		let savedPoint = CreateCurrentPoint(self, table);

		const moveToSavedPoint = () => {
			MoveToCurrentPoint(self, table, savedPoint);
			savedPoint = undefined;
		};

		const cells = DOM.SelectAll(TableCellSelector, table);
		for (const cell of cells) {
			DOM.SetAttr(cell, Options.ATTRIBUTE_SELECTED, '');
		}

		const stopDragEvent = (e: InputEvent) => {
			PreventEvent(e);
			DOM.Off(self.GetBody(), ENativeEvents.beforeinput, stopDragEvent);

			if (e.target === self.GetBody()) return moveToSavedPoint();

			const caret = CaretUtils.Get()[0];
			if (!caret) return moveToSavedPoint();

			const closestTable = DOM.Closest(FormatUtils.GetParentIfText(caret.Start.Node) as Element, TableSelector);
			if (closestTable === table) return moveToSavedPoint();

			const bPointLine = caret.SameRoot === caret.Start.Path[0];
			const bLineEmpty = bPointLine ? Str.IsEmpty(DOM.GetText(caret.SameRoot as HTMLElement)) : false;

			if (!!closestTable || (bPointLine && !bLineEmpty) || !DOM.Utils.IsText(caret.SameRoot) || Str.IsEmpty(caret.SameRoot.textContent) || !caret.SameRoot.parentNode) {
				DOM.InsertAfter(caret.Start.Path[0], table.parentNode);
				return moveToSavedPoint();
			}

			if (bPointLine && bLineEmpty) {
				self.GetBody().replaceChild(table.parentNode as Node, caret.SameRoot);
				return moveToSavedPoint();
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

			moveToSavedPoint();
		};

		DOM.On(self.GetBody(), ENativeEvents.beforeinput, stopDragEvent);
	});

	return movable;
};

export default Movable;