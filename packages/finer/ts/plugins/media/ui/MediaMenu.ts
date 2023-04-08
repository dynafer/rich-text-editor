import { Arr, Obj } from '@dynafer/utils';
import { IDOMToolsPartAttacher } from '../../../packages/dom/tools/Types';
import Editor from '../../../packages/Editor';
import MediaStyles from '../format/MediaStyles';
import { IPluginMediaUI } from '../UI';
import { IPluginMediaMenuFormatUI } from '../utils/Type';

export interface IMediaMenu {
	Create: IDOMToolsPartAttacher,
}

const MediaMenu = (editor: Editor, ui: IPluginMediaUI): IMediaMenu => {
	const self = editor;
	const DOM = self.DOM;

	const floatLeft = Finer.ILC.Get('plugins.tools.menu.floatLeft') ?? 'Align left with text wrapping';
	const floatRight = Finer.ILC.Get('plugins.tools.menu.floatRight') ?? 'Align right with text wrapping';

	const alignLeft = Finer.ILC.Get('plugins.tools.menu.alignLeft') ?? 'Align left with text break';
	const alignCenter = Finer.ILC.Get('plugins.tools.menu.alignCenter') ?? 'Align center with text break';
	const alignRight = Finer.ILC.Get('plugins.tools.menu.alignRight') ?? 'Align right with text break';

	const removeFigure = Finer.ILC.Get('plugins.tools.menu.remove.figure') ?? 'Remove the figure';

	const uiFormats: Record<string, IPluginMediaMenuFormatUI[]> = {
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

	const createCommand = (mediaMenu: HTMLElement, format: IPluginMediaMenuFormatUI, button: HTMLElement) =>
		(bActive: boolean) => {
			const { FigureElement } = DOM.Element.Figure.Find<HTMLElement>(mediaMenu);
			if (!FigureElement) return null;

			const toggler = MediaStyles(self, format);
			toggler.Toggle(bActive, FigureElement);

			const otherButtons = DOM.SelectAll({
				class: DOM.Utils.CreateUEID('icon-button', false)
			}, mediaMenu);

			Arr.Each(otherButtons, otherButton => DOM.RemoveClass(otherButton, ui.ACTIVE_CLASS));

			const toggleClass = bActive ? DOM.AddClass : DOM.RemoveClass;
			toggleClass(button, ui.ACTIVE_CLASS);
		};

	const createGroup = (mediaMenu: HTMLElement, formats: IPluginMediaMenuFormatUI[]): HTMLElement => {
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

			const command = createCommand(mediaMenu, format, button);

			DOM.On(button, Finer.NativeEventMap.click, () => command(!DOM.HasClass(button, ui.ACTIVE_CLASS)));

			DOM.Insert(group, button);
		});

		return group;
	};

	const createGroupWithoutFormat = (mediaMenu: HTMLElement): HTMLElement => {
		const group = DOM.Create('div', {
			class: DOM.Utils.CreateUEID('icon-group', false)
		});

		const button = DOM.Create('button', {
			attrs: [
				'data-remove',
				{ title: removeFigure }
			],
			class: DOM.Utils.CreateUEID('icon-button', false),
			html: Finer.Icons.Get(Finer.Icons.Get('Trash'))
		});

		DOM.On(button, Finer.NativeEventMap.click, () => DOM.Element.Figure.Remove(self, mediaMenu));

		DOM.Insert(group, button);

		return group;
	};

	const Create: IDOMToolsPartAttacher = (): HTMLElement | null => {
		const mediaMenu = DOM.Create('div', {
			attrs: ['data-tools-menu']
		});

		Obj.Values(uiFormats, formats => DOM.Insert(mediaMenu, createGroup(mediaMenu, formats)));

		DOM.Insert(mediaMenu, createGroupWithoutFormat(mediaMenu));

		return mediaMenu;
	};

	return {
		Create,
	};
};

export default MediaMenu;