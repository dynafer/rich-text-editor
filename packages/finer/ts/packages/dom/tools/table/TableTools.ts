import { Arr } from '@dynafer/utils';
import { ENativeEvents } from '../../../events/EventSetupUtils';
import Editor from '../../../Editor';
import { FigureSelector } from '../../../formatter/Format';
import AdjustableEdge from './AdjustableEdge';
import AdjustableLine from './AdjustableLine';
import Movable from './Movable';
import { ADJUSTABLE_LINE_HALF_SIZE, CreateAdjustableEdgeSize, CreateMovableHorizontalSize } from './TableToolsUtils';

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

		const movable = Movable(self, table);
		const adjustableLine = AdjustableLine(self, table);
		const adjustableEdge = AdjustableEdge(self, table);

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
			attrs: {
				dataFocused: ''
			}
		});

		for (const tools of toolList) {
			if (!!focused && DOM.Utils.IsChildOf(tools, focused)) continue;
			for (const [targetTools, eventName, event] of boundEvents) {
				if (tools !== targetTools) continue;
				DOM.Off(self.GetBody(), eventName, event);
			}
			DOM.Remove(tools, true);
		}
	};

	const ChangePositions = () => {
		for (const movable of DOM.SelectAll({ attrs: ['data-movable'] })) {
			const figure = DOM.Closest(movable, FigureSelector);
			const figureType = DOM.GetAttr(figure, 'type');
			if (!figure || !figureType) continue;

			const figureElement = DOM.Select<HTMLElement>(figureType, figure);
			if (!figureElement) continue;

			DOM.SetStyle(movable, 'left', CreateMovableHorizontalSize(figureElement.offsetLeft, true));
		}

		for (const line of DOM.SelectAll({ attrs: ['data-adjustable-line'] })) {
			const figure = DOM.Closest(line, FigureSelector);
			const figureType = DOM.GetAttr(figure, 'type');
			if (!figure || !figureType) continue;

			const figureElement = DOM.Select<HTMLElement>(figureType, figure);
			if (!figureElement) continue;

			const bWidth = DOM.HasAttr(line, 'data-adjustable-line', 'width');

			DOM.SetStyles(line, {
				width: `${bWidth ? ADJUSTABLE_LINE_HALF_SIZE * 2 - 1 : figureElement.offsetWidth}px`,
				height: `${bWidth ? figureElement.offsetHeight : ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`,
				left: `${bWidth ? 0 : figureElement.offsetLeft}px`,
				top: `${bWidth ? figureElement.offsetTop : 0}px`,
			});
		}

		for (const edge of DOM.SelectAll({ attrs: ['data-adjustable-edge'] })) {
			const figure = DOM.Closest(edge, FigureSelector);
			const figureType = DOM.GetAttr(figure, 'type');
			if (!figure || !figureType) continue;

			const figureElement = DOM.Select<HTMLElement>(figureType, figure);
			if (!figureElement) continue;

			const bLeft = DOM.HasAttr(edge, 'data-horizontal', 'left');
			const bTop = DOM.HasAttr(edge, 'data-vertical', 'top');

			DOM.SetStyles(edge, {
				left: CreateAdjustableEdgeSize(figureElement.offsetLeft + (bLeft ? 0 : figureElement.offsetWidth), true),
				top: CreateAdjustableEdgeSize(figureElement.offsetTop + (bTop ? 0 : figureElement.offsetHeight), true),
			});
		}
	};

	return {
		Create,
		RemoveAll,
		ChangePositions,
	};
};

export default TableTools;