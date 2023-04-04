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
				title: 'Move a table',
			},
		],
		styles: {
			left: CreateMovableHorizontalSize(table.offsetLeft + table.offsetWidth / 2, true),
		},
		html: Finer.Icons.Get('Move'),
	});

	DOM.On(movable, ENativeEvents.click, (event: MouseEvent) => {
		const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(event.target as Node);
		if (!Figure || !FigureElement) return;

		const cells = DOM.SelectAll(DOM.Element.Table.CellSelector, FigureElement);
		DOM.Element.Table.ToggleSelectMultipleCells(true, cells);

		DOM.SetAttr(Figure, Options.ATTRIBUTE_FOCUSED);

		self.Utils.Shared.DispatchCaretChange();
	});

	DOM.On(movable, ENativeEvents.dragstart, (event: DragEvent) => {
		const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(movable);
		if (!Figure || !FigureElement) return;

		event.dataTransfer?.setData('text/html', DOM.GetOuterHTML(FigureElement));
		event.dataTransfer?.setDragImage(FigureElement, 0, 0);

		let savedPoint = CreateCurrentPoint(self, FigureElement);

		const moveToSavedPoint = () => {
			MoveToCurrentPoint(self, FigureElement, savedPoint);
			savedPoint = undefined;
		};

		const cells = DOM.SelectAll(DOM.Element.Table.CellSelector, FigureElement);
		DOM.Element.Table.ToggleSelectMultipleCells(true, cells);

		DOM.SetAttr(Figure, Options.ATTRIBUTE_FOCUSED);

		const stopDragEvent = (e: InputEvent) => {
			PreventEvent(e);
			DOM.Off(self.GetBody(), ENativeEvents.beforeinput, stopDragEvent);

			if (e.target === self.GetBody()) return moveToSavedPoint();

			DOM.Element.Table.ToggleSelectMultipleCells(false, cells);
			const caret = CaretUtils.Get();
			DOM.Element.Table.ToggleSelectMultipleCells(true, cells);
			if (!caret) return moveToSavedPoint();

			const closestTable = DOM.Element.Table.GetClosest(FormatUtils.GetParentIfText(caret.Start.Node));
			if (closestTable === FigureElement) return moveToSavedPoint();

			const bPointLine = caret.SameRoot === caret.Start.Path[0];
			const bLineEmpty = bPointLine ? Str.IsEmpty(DOM.GetText(caret.SameRoot)) : false;

			if (!!closestTable || (bPointLine && !bLineEmpty) || !NodeType.IsText(caret.SameRoot) || Str.IsEmpty(caret.SameRoot.textContent) || !caret.SameRoot.parentNode) {
				DOM.InsertAfter(caret.Start.Path[0], Figure);
				return moveToSavedPoint();
			}

			if (bPointLine && bLineEmpty) {
				self.GetBody().replaceChild(Figure, caret.SameRoot);
				return moveToSavedPoint();
			}

			const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.SameRoot, caret.Start.Offset);

			DOM.InsertAfter(StartBlock, EndBlock, Figure);

			moveToSavedPoint();
		};

		DOM.On(self.GetBody(), ENativeEvents.beforeinput, stopDragEvent);
	});

	return movable;
};

export default Movable;