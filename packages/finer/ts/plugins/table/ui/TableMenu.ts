import { Arr, Obj } from '@dynafer/utils';
import { IDOMToolsPartAttacher } from '../../../packages/dom/tools/Types';
import Editor from '../../../packages/Editor';
import TableStyles from '../format/TableStyles';
import { IPluginTableMenuFormatUI } from '../Type';
import { IPluginTableUI } from '../UI';

export interface ITableMenu {
	Create: IDOMToolsPartAttacher,
}

const TableMenu = (editor: Editor, ui: IPluginTableUI): ITableMenu => {
	const self = editor;
	const DOM = self.DOM;

	const floatLeft = Finer.ILC.Get('plugins.tools.menu.floatLeft') ?? 'Align left with text wrapping';
	const floatRight = Finer.ILC.Get('plugins.tools.menu.floatRight') ?? 'Align right with text wrapping';

	const alignLeft = Finer.ILC.Get('plugins.tools.menu.alignLeft') ?? 'Align left with text break';
	const alignCenter = Finer.ILC.Get('plugins.tools.menu.alignCenter') ?? 'Align center with text break';
	const alignRight = Finer.ILC.Get('plugins.tools.menu.alignRight') ?? 'Align right with text break';

	const removeFigure = Finer.ILC.Get('plugins.tools.menu.remove.figure') ?? 'Remove the figure';

	const uiFormats: Record<string, IPluginTableMenuFormatUI[]> = {
		Float: [
			{ Name: 'Left', Title: floatLeft, Icon: 'MediaFloatLeft', Styles: { float: 'left' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
			{ Name: 'Right', Title: floatRight, Icon: 'MediaFloatRight', Styles: { float: 'right' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
		],
		Alignment: [
			{ Name: 'Left', Title: alignLeft, Icon: 'MediaAlignLeft', Styles: { marginLeft: '0px', marginRight: 'auto' }, SameStyles: ['float'] },
			{ Name: 'Center', Title: alignCenter, Icon: 'MediaAlignCenter', Styles: { marginLeft: 'auto', marginRight: 'auto' }, SameStyles: ['float'] },
			{ Name: 'Right', Title: alignRight, Icon: 'MediaAlignRight', Styles: { marginLeft: 'auto', marginRight: '0px' }, SameStyles: ['float'] },
		]
	};

	const createCommand = (tableMenu: HTMLElement, format: IPluginTableMenuFormatUI, button: HTMLElement) =>
		(bActive: boolean) => {
			const { FigureElement } = DOM.Element.Figure.Find<HTMLElement>(tableMenu);
			if (!FigureElement) return null;

			const toggler = TableStyles(self, format);
			toggler.Toggle(bActive, FigureElement);

			const otherButtons = DOM.SelectAll({
				class: DOM.Utils.CreateUEID('icon-button', false)
			}, tableMenu);

			Arr.Each(otherButtons, otherButton => DOM.RemoveClass(otherButton, ui.ACTIVE_CLASS));

			const toggleClass = bActive ? DOM.AddClass : DOM.RemoveClass;
			toggleClass(button, ui.ACTIVE_CLASS);
		};

	const createGroup = (tableMenu: HTMLElement, formats: IPluginTableMenuFormatUI[]): HTMLElement => {
		const group = DOM.Create('div', {
			class: DOM.Utils.CreateUEID('icon-group', false)
		});

		Arr.Each(formats, format => {
			const { Title, Icon } = format;

			const button = DOM.Create('button', {
				attrs: {
					title: Title,
				},
				class: DOM.Utils.CreateUEID('icon-button', false),
				html: Finer.Icons.Get(Icon)
			});

			const command = createCommand(tableMenu, format, button);

			DOM.On(button, Finer.NativeEventMap.click, () => command(!DOM.HasClass(button, ui.ACTIVE_CLASS)));

			DOM.Insert(group, button);
		});

		return group;
	};

	const createGroupWithoutFormat = (tableMenu: HTMLElement): HTMLElement => {
		const group = DOM.Create('div', {
			class: DOM.Utils.CreateUEID('icon-group', false)
		});

		const button = DOM.Create('button', {
			attrs: {
				title: removeFigure,
			},
			class: DOM.Utils.CreateUEID('icon-button', false),
			html: Finer.Icons.Get(Finer.Icons.Get('Trash'))
		});

		DOM.On(button, Finer.NativeEventMap.click, () => DOM.Element.Figure.Remove(self, tableMenu));

		DOM.Insert(group, button);

		return group;
	};

	const Create: IDOMToolsPartAttacher = (): HTMLElement | null => {
		const tableMenu = DOM.Create('div', {
			attrs: ['data-tools-menu']
		});

		Obj.Values(uiFormats, formats => DOM.Insert(tableMenu, createGroup(tableMenu, formats)));

		DOM.Insert(tableMenu, createGroupWithoutFormat(tableMenu));

		return tableMenu;
	};

	return {
		Create,
	};
};

export default TableMenu;