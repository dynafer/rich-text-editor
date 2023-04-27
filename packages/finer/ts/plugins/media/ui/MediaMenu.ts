import { Arr, Obj } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { IPartsToolAttacher } from '../../../packages/tools/types/PartsType';
import { IPluginMediaUI } from '../UI';
import { IPluginMediaMenuFormatUI } from '../utils/Type';
import { COMMAND_NAMES_MAP, GetMenuText } from '../utils/Utils';

export interface IMediaMenu {
	Create: IPartsToolAttacher,
}

const MediaMenu = (editor: Editor, ui: IPluginMediaUI): IMediaMenu => {
	const self = editor;
	const DOM = self.DOM;

	const uiFormats: Record<string, IPluginMediaMenuFormatUI[]> = {
		Float: [
			{ Title: GetMenuText(self, 'floatLeft', 'Align left with text wrapping'), CommandName: COMMAND_NAMES_MAP.FLOAT_LEFT, Icon: 'MediaFloatLeft' },
			{ Title: GetMenuText(self, 'floatRight', 'Align right with text wrapping'), CommandName: COMMAND_NAMES_MAP.FLOAT_RIGHT, Icon: 'MediaFloatRight' },
		],
		Alignment: [
			{ Title: GetMenuText(self, 'alignLeft', 'Align left with text break'), CommandName: COMMAND_NAMES_MAP.ALIGN_LEFT, Icon: 'MediaAlignLeft' },
			{ Title: GetMenuText(self, 'alignCenter', 'Align center with text break'), CommandName: COMMAND_NAMES_MAP.ALIGN_CENTER, Icon: 'MediaAlignCenter' },
			{ Title: GetMenuText(self, 'alignRight', 'Align right with text break'), CommandName: COMMAND_NAMES_MAP.ALIGN_RIGHT, Icon: 'MediaAlignRight' },
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
				{ title: GetMenuText(self, 'remove.figure', 'Remove the figure') }
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

	const Create: IPartsToolAttacher = (): HTMLElement => {
		const mediaMenu = DOM.Create('div', {
			attrs: ['data-parts-menu']
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