import { Arr, Obj } from '@dynafer/utils';
import { IDOMToolsPartAttacher } from '../../../packages/dom/tools/Types';
import Editor from '../../../packages/Editor';
import { IPluginMediaUI } from '../UI';
import { IPluginMediaMenuFormatUI } from '../utils/Type';
import { COMMAND_NAMES_MAP } from '../utils/Utils';

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
			{ Title: floatLeft, CommandName: COMMAND_NAMES_MAP.FLOAT_LEFT, Icon: 'MediaFloatLeft' },
			{ Title: floatRight, CommandName: COMMAND_NAMES_MAP.FLOAT_RIGHT, Icon: 'MediaFloatRight' },
		],
		Alignment: [
			{ Title: alignLeft, CommandName: COMMAND_NAMES_MAP.ALIGN_LEFT, Icon: 'MediaAlignLeft' },
			{ Title: alignCenter, CommandName: COMMAND_NAMES_MAP.ALIGN_CENTER, Icon: 'MediaAlignCenter' },
			{ Title: alignRight, CommandName: COMMAND_NAMES_MAP.ALIGN_RIGHT, Icon: 'MediaAlignRight' },
		]
	};

	const createGroup = (mediaMenu: HTMLElement, formats: IPluginMediaMenuFormatUI[]): HTMLElement => {
		const group = DOM.Create('div', {
			class: DOM.Utils.CreateUEID('icon-group', false)
		});

		Arr.Each(formats, format => {
			const { Title, CommandName, Icon } = format;

			const button = DOM.Create('button', {
				attrs: {
					title: Title,
				},
				class: DOM.Utils.CreateUEID('icon-button', false),
				html: Finer.Icons.Get(Icon)
			});

			DOM.On(button, Finer.NativeEventMap.click, event => {
				Finer.PreventEvent(event);
				const bActive = !DOM.HasClass(button, ui.ACTIVE_CLASS);
				self.Commander.Run<boolean | HTMLElement>(CommandName, bActive, mediaMenu);

				const otherButtons = DOM.SelectAll({
					class: DOM.Utils.CreateUEID('icon-button', false)
				}, mediaMenu);

				Arr.Each(otherButtons, otherButton => DOM.RemoveClass(otherButton, ui.ACTIVE_CLASS));

				const toggleClass = bActive ? DOM.AddClass : DOM.RemoveClass;
				toggleClass(button, ui.ACTIVE_CLASS);
			});

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

		DOM.On(button, Finer.NativeEventMap.click, event => {
			Finer.PreventEvent(event);
			self.Commander.Run(COMMAND_NAMES_MAP.MEDIA_REMOVE, mediaMenu);
		});

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