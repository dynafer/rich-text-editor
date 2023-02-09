import { Arr } from '@dynafer/utils';
import { ENativeEvents } from '../../../events/EventSetupUtils';
import Editor from '../../../Editor';
import AdjustableEdge from './AdjustableEdge';
import AdjustableLine from './AdjustableLine';
import Movable from './Movable';

export interface ITableTools {
	Create: (table: HTMLElement) => HTMLElement,
	RemoveAll: () => void,
}

const TableTools = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const boundEvents: [HTMLElement, ENativeEvents, (event: Event) => void][] = [];

	const Create = (table: HTMLElement): HTMLElement => {
		const tools = DOM.Create('div', {
			attrs: {
				dataType: 'table-tool',
			},
		});

		const movable = Movable(self, table);
		const adjustableEdge = AdjustableEdge(self, table);
		const adjustableLine = AdjustableLine(self, table);

		DOM.Insert(tools, movable, adjustableEdge, adjustableLine.Element);

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

	return {
		Create,
		RemoveAll,
	};
};

export default TableTools;