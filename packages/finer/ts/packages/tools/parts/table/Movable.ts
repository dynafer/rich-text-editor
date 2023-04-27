import { NodeType } from '@dynafer/dom-control';
import { Str } from '@dynafer/utils';
import Options from '../../../../Options';
import Editor from '../../../Editor';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import FormatUtils from '../../../formatter/FormatUtils';
import { CreateMovableHorizontalSize } from '../Utils';
import { CreateCurrentPoint, MoveToCurrentPoint } from './TableToolsUtils';

const Movable = (editor: Editor, table: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const movable = DOM.Create('div', {
		attrs: [
			'data-movable',
			{
				draggable: 'true',
				title: self.Lang('plugins.parts.menu.table.move', 'Move a table'),
			},
		],
		styles: {
			left: CreateMovableHorizontalSize(table.offsetLeft + table.offsetWidth / 2, true),
		},
		html: Finer.Icons.Get('Move'),
	});

	DOM.On(movable, ENativeEvents.mouseup, (event: MouseEvent) => {
		if (!event.target) return;

		const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(event.target);
		if (!Figure || !FigureElement) return;

		const cells = DOM.Element.Table.GetAllOwnCells(FigureElement);
		DOM.Element.Table.ToggleSelectMultipleCells(true, cells);

		DOM.SetAttr(Figure, Options.ATTRIBUTE_FOCUSED);

		self.Utils.Shared.DispatchCaretChange();
	});

	DOM.On(movable, ENativeEvents.dragstart, (event: DragEvent) => {
		const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(movable);
		if (!Figure || !FigureElement) return;

		self.Dispatch('Tools:Move:Start', FigureElement);

		event.dataTransfer?.setData('text/html', DOM.GetOuterHTML(FigureElement));
		event.dataTransfer?.setDragImage(FigureElement, 0, 0);

		let savedPoint = CreateCurrentPoint(self, FigureElement);

		const moveToSavedPoint = (bCancelled: boolean) => {
			MoveToCurrentPoint(self, FigureElement, savedPoint);
			savedPoint = undefined;
			self.Dispatch(Str.Merge('Tools:Move:', bCancelled ? 'Cancel' : 'Finish'), FigureElement);
		};

		const cells = DOM.Element.Table.GetAllOwnCells(FigureElement);
		DOM.Element.Table.ToggleSelectMultipleCells(true, cells);

		DOM.SetAttr(Figure, Options.ATTRIBUTE_FOCUSED);

		const dropEvent = (e: InputEvent) => {
			PreventEvent(e);
			self.Off(ENativeEvents.beforeinput, dropEvent);

			if (e.target === self.GetBody()) return moveToSavedPoint(true);

			DOM.Element.Table.ToggleSelectMultipleCells(false, cells);
			const caret = CaretUtils.Get();
			if (!caret) return moveToSavedPoint(true);

			const closestTable = DOM.Element.Table.FindClosest(FormatUtils.GetParentIfText(caret.Start.Node));
			if (closestTable === FigureElement) return moveToSavedPoint(true);

			const bPointLine = caret.SameRoot === caret.Start.Path[0];
			const bLineEmpty = bPointLine ? Str.IsEmpty(DOM.GetText(caret.SameRoot)) : false;

			if (!!closestTable || (bPointLine && !bLineEmpty) || !NodeType.IsText(caret.SameRoot) || Str.IsEmpty(caret.SameRoot.textContent) || !caret.SameRoot.parentNode) {
				DOM.InsertAfter(caret.Start.Path[0], Figure);
				return moveToSavedPoint(false);
			}

			if (bPointLine && bLineEmpty) {
				self.GetBody().replaceChild(Figure, caret.SameRoot);
				return moveToSavedPoint(false);
			}

			const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.SameRoot, caret.Start.Offset);

			DOM.InsertAfter(StartBlock, EndBlock, Figure);

			moveToSavedPoint(false);
		};

		self.On(ENativeEvents.beforeinput, dropEvent, true);
	});

	return movable;
};

export default Movable;