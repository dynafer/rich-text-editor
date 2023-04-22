import { Arr } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { IPluginsTableFormatUI } from '../Type';
import { COMMAND_NAMES_MAP } from '../Utils';

const Table = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const formatter = self.Formatter;
	const formatUI = formatter.UI;

	const uiName = 'Table';
	const uiFormat: IPluginsTableFormatUI = {
		Format: { Tag: DOM.Element.Table.Selector },
		Title: self.Lang('plugins.table.title', 'Create a table'),
		Icon: 'Table'
	};

	const numRows = 10;
	const numCells = 10;

	const setNavigationText = (navigation: HTMLElement, row: number, cell: number, add: number = 1) =>
		DOM.SetHTML(navigation, `${row + add} × ${cell + add}`);

	const bindCellMouseEnterEvent = (navigation: HTMLElement, cellItem: HTMLElement, row: number, cell: number) =>
		DOM.On(cellItem, Finer.NativeEventMap.mouseenter, () => {
			if (!cellItem.parentElement?.parentElement) return;

			for (let rowIndex = 0; rowIndex < numCells; ++rowIndex) {
				const itemRowToHover = DOM.Select({
					attrs: {
						row: rowIndex.toString()
					}
				}, cellItem.parentElement?.parentElement);

				const cells = DOM.GetChildren(itemRowToHover, false);
				for (let cellIndex = 0; cellIndex < numCells; ++cellIndex) {
					const bHovered = rowIndex <= row && cellIndex <= cell;
					const toggle = bHovered ? DOM.AddClass : DOM.RemoveClass;
					toggle(cells[cellIndex], 'hover');
				}
			}

			setNavigationText(navigation, row, cell);
		});

	const removeAllHovered = (navigation: HTMLElement, parent: Node | null) =>
		() => {
			Arr.Each(DOM.SelectAll('.hover', parent), hovered => DOM.RemoveClass(hovered, 'hover'));

			setNavigationText(navigation, 1, 1, 0);
		};

	const createRowsAndCells = (navigation: HTMLElement): HTMLElement[] => {
		const items: HTMLElement[] = [];

		for (let row = 0; row < numRows; ++row) {
			const rowItem = formatUI.CreateItemGroup();
			DOM.SetAttr(rowItem, 'row', row.toString());

			for (let cell = 0; cell < numCells; ++cell) {
				const cellItem = formatUI.Create({
					tagName: formatter.Formats.ListItemSelector,
					type: 'option-item',
				});

				DOM.SetAttr(cellItem, 'cell', cell.toString());

				DOM.Insert(rowItem, cellItem);

				bindCellMouseEnterEvent(navigation, cellItem, row, cell);

				const upEvent = () => self.Commander.Run(COMMAND_NAMES_MAP.TABLE_CREATE, row, cell);

				DOM.On(cellItem, Finer.NativeEventMap.mouseup, upEvent);
				DOM.On(cellItem, Finer.NativeEventMap.touchend, upEvent);
			}
			Arr.Push(items, rowItem);
		}

		return items;
	};

	const createOptionList = (wrapper: HTMLElement) =>
		(): HTMLElement => {
			const navigationWrapper = formatUI.Create({
				tagName: formatter.Formats.ListItemSelector,
				type: 'option-item',
			});

			const navigation = DOM.Create('div');
			setNavigationText(navigation, 1, 1, 0);

			DOM.Insert(navigationWrapper, navigation);
			DOM.On(navigationWrapper, Finer.NativeEventMap.mouseover, removeAllHovered(navigation, navigationWrapper.parentElement));

			const items: HTMLElement[] = createRowsAndCells(navigation);
			Arr.Push(items, navigationWrapper);

			const tableList = formatUI.CreateOptionList(uiName, items);
			DOM.SetAttr(tableList, DOM.Element.Table.Selector, 'true');
			DOM.On(tableList, Finer.NativeEventMap.mouseleave, removeAllHovered(navigation, tableList));

			DOM.Insert(self.Frame.Root, tableList);
			formatUI.SetOptionListCoordinate(self, uiName, wrapper, tableList);
			return tableList;
		};

	const iconWrap = formatUI.CreateIconWrapSet(uiFormat.Title, uiFormat.Icon);

	DOM.SetAttr(iconWrap.Wrapper, 'no-border');

	formatUI.BindOptionListEvent(self, {
		type: uiName,
		activable: iconWrap.Wrapper,
		clickable: iconWrap.Wrapper,
		create: createOptionList(iconWrap.Wrapper)
	});

	self.Toolbar.Add(uiName, iconWrap.Wrapper);
};

export default Table;