import { Arr } from '@dynafer/utils';
import Options from '../../../../Options';
import Editor from '../../../Editor';
import { ENativeEvents } from '../../../events/EventSetupUtils';
import { FigureSelector } from '../../../formatter/Format';
import AdjustableEdge from './AdjustableEdge';
import AdjustableLine from './AdjustableLine';
import Movable from './Movable';
import { ADJUSTABLE_LINE_HALF_SIZE, CreateAdjustableEdgeSize, CreateMovableHorizontalSize, GetTableGridWithIndex } from './TableToolsUtils';

export interface ITableTools {
	Create: (table: HTMLElement) => HTMLElement,
	RemoveAll: () => void,
	ChangePositions: () => void,
}

const TableTools = (editor: Editor): ITableTools => {
	const self = editor;
	const DOM = self.DOM;

	const boundEvents: [HTMLElement, ENativeEvents, EventListener][] = [];

	const Create = (table: HTMLElement): HTMLElement => {
		const tools = DOM.Create('div', {
			attrs: {
				dataType: 'table-tool',
			},
		});

		const tableGrid = GetTableGridWithIndex(self, table);

		const movable = Movable(self, table);
		const adjustableLine = AdjustableLine(self, table, tableGrid);
		const adjustableEdge = AdjustableEdge(self, table, tableGrid);

		DOM.Insert(tools, movable, adjustableLine.Element, adjustableEdge);

		Arr.Push(boundEvents, [tools, ...adjustableLine.BoundEvents]);

		return tools;
	};

	const RemoveAll = () => {
		const toolList = DOM.SelectAll({
			attrs: {
				dataType: 'table-tool'
			}
		});

		const focused = DOM.Select({
			attrs: [Options.ATTRIBUTE_FOCUSED]
		});

		Arr.Each(toolList, tools => {
			if (!!focused && DOM.Utils.IsChildOf(tools, focused) && DOM.Closest(tools, FigureSelector) === focused) return;
			Arr.Each(boundEvents, ([targetTools, eventName, event]) => {
				if (tools !== targetTools) return;
				DOM.Off(self.GetBody(), eventName, event);
			});
			DOM.Remove(tools, true);
		});
	};

	const ChangePositions = () => {
		Arr.Each(DOM.SelectAll({ attrs: ['data-movable'] }), movable => {
			const figure = DOM.Closest(movable, FigureSelector);
			const figureType = DOM.GetAttr(figure, 'type');
			if (!figure || !figureType) return;

			const figureElement = DOM.Select<HTMLElement>(figureType, figure);
			if (!figureElement) return;

			DOM.SetStyle(movable, 'left', CreateMovableHorizontalSize(figureElement.offsetLeft, true));
		});

		Arr.Each(DOM.SelectAll({ attrs: ['data-adjustable-line'] }), line => {
			const figure = DOM.Closest(line, FigureSelector);
			const figureType = DOM.GetAttr(figure, 'type');
			if (!figure || !figureType) return;

			const figureElement = DOM.Select<HTMLElement>(figureType, figure);
			if (!figureElement) return;

			const bWidth = DOM.HasAttr(line, 'data-adjustable-line', 'width');

			DOM.SetStyles(line, {
				width: `${bWidth ? ADJUSTABLE_LINE_HALF_SIZE * 2 - 1 : figureElement.offsetWidth}px`,
				height: `${bWidth ? figureElement.offsetHeight : ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`,
				left: `${bWidth ? 0 : figureElement.offsetLeft}px`,
				top: `${bWidth ? figureElement.offsetTop : 0}px`,
			});
		});

		Arr.Each(DOM.SelectAll({ attrs: ['data-adjustable-edge'] }), edge => {
			const figure = DOM.Closest(edge, FigureSelector);
			const figureType = DOM.GetAttr(figure, 'type');
			if (!figure || !figureType) return;

			const figureElement = DOM.Select<HTMLElement>(figureType, figure);
			if (!figureElement) return;

			const bLeft = DOM.HasAttr(edge, 'data-horizontal', 'left');
			const bTop = DOM.HasAttr(edge, 'data-vertical', 'top');

			DOM.SetStyles(edge, {
				left: CreateAdjustableEdgeSize(figureElement.offsetLeft + (bLeft ? 0 : figureElement.offsetWidth), true),
				top: CreateAdjustableEdgeSize(figureElement.offsetTop + (bTop ? 0 : figureElement.offsetHeight), true),
			});
		});
	};

	return {
		Create,
		RemoveAll,
		ChangePositions,
	};
};

export default TableTools;