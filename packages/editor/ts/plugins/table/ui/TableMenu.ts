import Options from '../../../Options';
import Editor from '../../../packages/Editor';
import { IPartsToolAttacher } from '../../../packages/tools/types/PartsType';
import { COMMAND_NAMES_MAP, GetMenuText } from '../Utils';
import Alignment from './menu/Alignment';
import RowColumn from './menu/RowColumn';

export interface ITableMenu {
	Create: IPartsToolAttacher,
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
		DOM.SetAttr(button, Options.ATTRIBUTES.REMOVE);

		formatUI.BindClickEvent(button, () => self.Commander.Run(COMMAND_NAMES_MAP.TABLE_REMOVE, tableMenu));

		DOM.Insert(group, button);

		return group;
	};

	const Create: IPartsToolAttacher = (e: Editor, table: HTMLElement): HTMLElement => {
		const tableMenu = DOM.Create('div', {
			attrs: [Options.ATTRIBUTES.PARTS_MENU]
		});

		DOM.Insert(tableMenu, Alignment(self, table, tableMenu), RowColumn(self, table, tableMenu), createGroupWithoutFormat(tableMenu));

		return tableMenu;
	};

	return {
		Create,
	};
};

export default TableMenu;