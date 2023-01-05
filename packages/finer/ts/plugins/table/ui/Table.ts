import { Arr, Str } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import TableFormat from '../format/Table';
import { IPluginsTableFormatUI } from '../Type';
import { IPluginTableUI } from '../UI';

const Table = (editor: Editor, ui: IPluginTableUI) => {
	const self = editor;
	const DOM = self.GetRootDOM();
	const formatUI = self.Formatter.UI;
	const formatterFormats = self.Formatter.Formats;

	const uiName = 'Table';
	const uiFormat: IPluginsTableFormatUI = {
		Format: { Tag: formatterFormats.TableSelector },
		Title: 'Create a table',
		Icon: 'Table'
	};

	const numRows = 10;
	const numCells = 10;

	const setNavigationText = (navigation: HTMLElement, row: number, cell: number, add: number = 1) =>
		DOM.SetHTML(navigation, Str.Merge((row + add).toString(), ' × ', (cell + add).toString()));

	const bindCellMouseEnterEvent = (navigation: HTMLElement, cellItem: HTMLElement, row: number, cell: number) =>
		DOM.On(cellItem, 'mouseenter', () => {
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

	const removeAllHovered = (navigation: HTMLElement, parent: Node) =>
		() => {
			for (const hovered of DOM.SelectAll('.hover', parent)) {
				DOM.RemoveClass(hovered, 'hover');
			}

			setNavigationText(navigation, 1, 1, 0);
		};

	const createRowsAndCells = (navigation: HTMLElement): HTMLElement[] => {
		const items: HTMLElement[] = [];

		for (let row = 0; row < numRows; ++row) {
			const rowItem = formatUI.CreateItemGroup();
			DOM.SetAttrs(rowItem, {
				row: row.toString(),
			});

			for (let cell = 0; cell < numCells; ++cell) {
				const cellItem = formatUI.Create({
					tagName: 'li',
					type: 'option-item',
				});

				DOM.SetAttrs(cellItem, {
					cell: cell.toString(),
				});

				DOM.Insert(rowItem, cellItem);

				bindCellMouseEnterEvent(navigation, cellItem, row, cell);

				formatUI.BindClickEvent(cellItem, () => {
					const tableFormat = TableFormat(self);

					tableFormat.CreateFromCaret(row, cell);
				});
			}
			Arr.Push(items, rowItem);
		}

		return items;
	};

	const createOptionList = (wrapper: HTMLElement) =>
		() => {
			const navigationWrapper = formatUI.Create({
				tagName: 'li',
				type: 'option-item',
			});

			const navigation = DOM.Create('div');
			setNavigationText(navigation, 1, 1, 0);

			DOM.Insert(navigationWrapper, navigation);
			DOM.On(navigationWrapper, 'mouseover', removeAllHovered(navigation, navigationWrapper.parentElement as Node));

			const items: HTMLElement[] = createRowsAndCells(navigation);
			Arr.Push(items, navigationWrapper);

			const tableList = formatUI.CreateOptionList(uiName, items);
			DOM.SetAttr(tableList, formatterFormats.TableSelector, 'true');
			DOM.On(tableList, 'mouseleave', removeAllHovered(navigation, tableList));

			DOM.Insert(self.Frame.Root, tableList);
			formatUI.SetOptionListCoordinate(self, uiName, wrapper, tableList);
		};

	const Create = () => {
		const iconWrap = ui.CreateIconWrap(uiFormat);

		formatUI.BindOptionListEvent(self, uiName, iconWrap.Wrapper, createOptionList(iconWrap.Wrapper));

		self.Toolbar.Add('Table', iconWrap.Wrapper);
	};

	return {
		Create
	};
};

export default Table;