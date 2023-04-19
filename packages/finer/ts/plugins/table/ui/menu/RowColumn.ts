import { Arr, Obj, Str } from '@dynafer/utils';
import Editor from '../../../../packages/Editor';
import { IPluginTableMenuFormatUI } from '../../Type';
import { CanDeleteRowColumn, COMMAND_NAMES_MAP, GetMenuText } from '../../Utils';

interface IPluginRowColumnItem {
	Label: string,
	CommandName: string,
	CommandArgs?: unknown[],
}

interface IPluginRowColumnFormatUI extends Omit<IPluginTableMenuFormatUI, 'CommandName'> {
	Type: string,
	Items: IPluginRowColumnItem[],
}

const RowColumn = (editor: Editor, table: HTMLElement, tableMenu: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;
	const formatUI = self.Formatter.UI;

	const uiFormats: Record<string, IPluginRowColumnFormatUI> = {
		Row: {
			Type: 'TableRow',
			Title: GetMenuText('table.row', 'Table Row'),
			Icon: 'TableRow',
			Items: [
				{ Label: GetMenuText('table.row.insert.above', 'Insert row above'), CommandName: COMMAND_NAMES_MAP.ROW.INSERT, CommandArgs: [true] },
				{ Label: GetMenuText('table.row.insert.below', 'Insert row below'), CommandName: COMMAND_NAMES_MAP.ROW.INSERT, CommandArgs: [false] },
				{ Label: GetMenuText('table.row.select', 'Select row'), CommandName: COMMAND_NAMES_MAP.ROW.SELECT },
				{ Label: GetMenuText('table.row.delete', 'Delete row'), CommandName: COMMAND_NAMES_MAP.ROW.DELETE },
			]
		},
		Column: {
			Type: 'TableColumn',
			Title: GetMenuText('table.column', 'Table Column'),
			Icon: 'TableColumn',
			Items: [
				{ Label: GetMenuText('table.column.insert.left', 'Insert column left'), CommandName: COMMAND_NAMES_MAP.COLUMN.INSERT, CommandArgs: [true] },
				{ Label: GetMenuText('table.column.insert.right', 'Insert column right'), CommandName: COMMAND_NAMES_MAP.COLUMN.INSERT, CommandArgs: [false] },
				{ Label: GetMenuText('table.column.select', 'Select column'), CommandName: COMMAND_NAMES_MAP.COLUMN.SELECT },
				{ Label: GetMenuText('table.column.delete', 'Delete column'), CommandName: COMMAND_NAMES_MAP.COLUMN.DELETE },
			]
		},
	};

	const shouldDisable = (uiName: string, format: IPluginRowColumnItem): boolean => {
		const { CommandName } = format;
		if (!Str.Contains(Str.LowerCase(CommandName), 'delete')) return false;

		const type = Str.Contains(Str.LowerCase(uiName), 'row') ? 'row' : 'column';

		return !CanDeleteRowColumn(self, type, table);
	};

	const createOptions = (uiName: string, formats: IPluginRowColumnItem[]): HTMLElement[] => {
		const items: HTMLElement[] = [];

		Arr.Each(formats, format => {
			const { Label, CommandName, CommandArgs } = format;

			const item = formatUI.CreateOption(Label, Label, false, false);

			const bDisable = shouldDisable(uiName, format);
			formatUI.ToggleDisable(item, bDisable);

			if (!bDisable) formatUI.BindClickEvent(item, () => {
				self.Commander.Run(CommandName, ...(CommandArgs ?? []));
				self.GetBody().click();
			});

			Arr.Push(items, item);
		});

		return items;
	};

	const createOptionList = (uiName: string, formats: IPluginRowColumnItem[]): HTMLElement => {
		const options = formatUI.CreateOptionList(uiName, createOptions(uiName, formats));

		return options;
	};

	const group = DOM.Create('div', {
		class: DOM.Utils.CreateUEID('icon-group', false)
	});

	Obj.Values(uiFormats, uiFormat => {
		const { Wrapper } = formatUI.CreateIconWrapSet(uiFormat.Title, uiFormat.Icon);
		DOM.SetAttrs(Wrapper, [
			'no-border',
			{ dataType: uiFormat.Type }
		]);

		formatUI.BindOptionListEvent(self, {
			type: uiFormat.Type,
			activable: Wrapper,
			clickable: Wrapper,
			create: () => {
				const optionList = createOptionList(uiFormat.Type, uiFormat.Items);
				DOM.Insert(tableMenu, optionList);
				formatUI.SetOptionListInToolsMenuCoordinate(self, Wrapper, optionList);
			},
			root: tableMenu
		});

		DOM.Insert(group, Wrapper);
	});

	return group;
};

export default RowColumn;