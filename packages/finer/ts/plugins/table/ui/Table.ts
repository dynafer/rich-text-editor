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
	const numColumns = 10;

	const setNavigationText = (navigation: HTMLElement, row: number, column: number, add: number = 1) =>
		DOM.SetHTML(navigation, Str.Merge((row + add).toString(), ' × ', (column + add).toString()));

	const bindCellMouseEnterEvent = (navigation: HTMLElement, columnItem: HTMLElement, row: number, column: number) =>
		DOM.On(columnItem, 'mouseenter', () => {
			if (!columnItem.parentElement?.parentElement) return;

			for (let rowIndex = 0; rowIndex < numColumns; ++rowIndex) {
				const itemRowToHover = DOM.Select({
					attrs: {
						row: rowIndex.toString()
					}
				}, columnItem.parentElement?.parentElement);

				const columns = DOM.GetChildren(itemRowToHover, false);
				for (let columnIndex = 0; columnIndex < numColumns; ++columnIndex) {
					const bHovered = rowIndex <= row && columnIndex <= column;
					const toggle = bHovered ? DOM.AddClass : DOM.RemoveClass;
					toggle(columns[columnIndex], 'hover');
				}
			}

			setNavigationText(navigation, row, column);
		});

	const removeAllHovered = (navigation: HTMLElement, parent: Node) =>
		() => {
			for (const hovered of DOM.SelectAll('.hover', parent)) {
				DOM.RemoveClass(hovered, 'hover');
			}

			setNavigationText(navigation, 1, 1, 0);
		};

	const createRowsAndColumns = (navigation: HTMLElement): HTMLElement[] => {
		const items: HTMLElement[] = [];

		for (let row = 0; row < numRows; ++row) {
			const rowItem = formatUI.CreateItemGroup();
			DOM.SetAttrs(rowItem, {
				row: row.toString(),
			});

			for (let column = 0; column < numColumns; ++column) {
				const columnItem = formatUI.Create({
					tagName: 'li',
					type: 'option-item',
				});

				DOM.SetAttrs(columnItem, {
					column: column.toString(),
				});

				DOM.Insert(rowItem, columnItem);

				bindCellMouseEnterEvent(navigation, columnItem, row, column);

				formatUI.BindClickEvent(columnItem, () => {
					const tableFormat = TableFormat(self);

					tableFormat.CreateFromCaret(row, column);
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

			const items: HTMLElement[] = createRowsAndColumns(navigation);
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