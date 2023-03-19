import { Arr } from '@dynafer/utils';
import Options from '../../../../Options';
import Editor from '../../../Editor';
import { ENativeEvents } from '../../../events/EventSetupUtils';
import { FigureSelector, TableSelector } from '../../../formatter/Format';
import AdjustableEdge from './AdjustableEdge';
import AdjustableLine from './AdjustableLine';
import Movable from './Movable';
import { GetTableGridWithIndex } from './TableToolsUtils';

export interface ITableTools {
	Create: (table: HTMLElement) => HTMLElement,
	RemoveAll: (except?: Element | null) => void,
}

const TableTools = (editor: Editor): ITableTools => {
	const self = editor;
	const DOM = self.DOM;

	const boundEvents: [HTMLElement, ENativeEvents, EventListener][] = [];

	const Create = (table: HTMLElement): HTMLElement => {
		const tools = DOM.Create('div', {
			attrs: {
				dataType: 'table-tool',
				dataFixed: 'dom-tool',
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

	const RemoveAll = (except?: Element | null) => {
		const toolList = DOM.SelectAll({
			attrs: {
				dataType: 'table-tool'
			}
		}, self.GetBody());

		const focused = DOM.Select({
			attrs: [
				Options.ATTRIBUTE_FOCUSED,
				{ type: TableSelector }
			]
		}, self.GetBody());

		const isSkippable = (tools: HTMLElement): boolean =>
			(!!focused && DOM.Utils.IsChildOf(tools, focused) && DOM.Closest(tools, FigureSelector) === focused)
			|| (!!except && DOM.Utils.IsChildOf(tools, except));

		Arr.Each(toolList, tools => {
			if (isSkippable(tools)) return;
			Arr.Each(boundEvents, ([targetTools, eventName, event]) => {
				if (tools !== targetTools) return;
				DOM.Off(self.GetBody(), eventName, event);
			});
			DOM.Remove(tools, true);
		});
	};

	return {
		Create,
		RemoveAll,
	};
};

export default TableTools;