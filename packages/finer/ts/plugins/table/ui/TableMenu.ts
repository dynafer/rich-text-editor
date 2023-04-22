import { IDOMToolsPartAttacher } from '../../../packages/dom/tools/Types';
import Editor from '../../../packages/Editor';
import { COMMAND_NAMES_MAP, GetMenuText } from '../Utils';
import Alignment from './menu/Alignment';
import RowColumn from './menu/RowColumn';

export interface ITableMenu {
	Create: IDOMToolsPartAttacher,
}

const TableMenu = (editor: Editor): ITableMenu => {
	const self = editor;
	const DOM = self.DOM;
	const formatUI = self.Formatter.UI;

	const createGroupWithoutFormat = (tableMenu: HTMLElement): HTMLElement => {
		const group = DOM.Create('div', {
			class: DOM.Utils.CreateUEID('icon-group', false)
		});

		const button = formatUI.CreateIconButton(GetMenuText(self, 'remove.figure', 'Remove the figure'), 'Trash');
		DOM.SetAttr(button, 'data-remove');

		formatUI.BindClickEvent(button, () => self.Commander.Run(COMMAND_NAMES_MAP.TABLE_REMOVE, tableMenu));

		DOM.Insert(group, button);

		return group;
	};

	const Create: IDOMToolsPartAttacher = (e: Editor, table: HTMLElement): HTMLElement => {
		const tableMenu = DOM.Create('div', {
			attrs: ['data-tools-menu']
		});

		DOM.Insert(tableMenu, Alignment(self, table, tableMenu), RowColumn(self, table, tableMenu), createGroupWithoutFormat(tableMenu));

		return tableMenu;
	};

	return {
		Create,
	};
};

export default TableMenu;