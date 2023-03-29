import { Arr, Obj } from '@dynafer/utils';
import Options from '../../../Options';
import { IDOMToolsPartAttacher } from '../../../packages/dom/tools/Types';
import Editor from '../../../packages/Editor';
import MediaStyles from '../format/MediaStyles';
import { IPluginMediaUI } from '../UI';
import { IPluginMediaMenuFormatUI } from '../utils/Type';
import { ATTRIBUTE_AS_TEXT, IMAGE_MENU_ADDABLE_TOP } from '../utils/Utils';

export interface IMediaMenu {
	Create: IDOMToolsPartAttacher,
	ChangePosition: () => void,
}

const MediaMenu = (editor: Editor, ui: IPluginMediaUI): IMediaMenu => {
	const self = editor;
	const DOM = self.DOM;

	const uiFormats: Record<string, IPluginMediaMenuFormatUI[]> = {
		Float: [
			{ Name: 'Left', Title: 'Align left with text wrapping', Icon: 'MediaFloatLeft', Styles: { float: 'left' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
			{ Name: 'Right', Title: 'Align right with text wrapping', Icon: 'MediaFloatRight', Styles: { float: 'right' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
		],
		Alignment: [
			{ Name: 'Left', Title: 'Align left with text break', Icon: 'MediaAlignLeft', Styles: { marginLeft: '0px', marginRight: 'auto' }, SameStyles: ['float'] },
			{ Name: 'Center', Title: 'Align center with text break', Icon: 'MediaAlignCenter', Styles: { marginLeft: 'auto', marginRight: 'auto' }, SameStyles: ['float'] },
			{ Name: 'Right', Title: 'Align right with text break', Icon: 'MediaAlignRight', Styles: { marginLeft: 'auto', marginRight: '0px' }, SameStyles: ['float'] },
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

	const Create: IDOMToolsPartAttacher = (): HTMLElement | null => {
		const mediaMenu = DOM.Create('div', {
			attrs: {
				dataMediaMenu: ''
			}
		});

		Obj.Values(uiFormats, formats => DOM.Insert(mediaMenu, createGroup(mediaMenu, formats)));

		return mediaMenu;
	};

	const ChangePosition = () =>
		Arr.Each(DOM.SelectAll<HTMLElement>({ attrs: ['data-media-menu'] }, self.GetBody()), mediaMenu => {
			const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(mediaMenu);
			if (!Figure || !FigureElement) return;

			if (!DOM.HasAttr(Figure, Options.ATTRIBUTE_FOCUSED)) return DOM.Hide(mediaMenu);
			DOM.Show(mediaMenu);

			const newStyles: Record<string, string> = {};

			const figureRightPosition = Figure.offsetLeft + Figure.offsetWidth;
			const figureElementRightPosition = FigureElement.offsetLeft + FigureElement.offsetWidth;
			const halfWithDifference = (FigureElement.offsetWidth - mediaMenu.offsetWidth) / 2;
			const menuCentredLeftPosition = figureElementRightPosition - mediaMenu.offsetWidth - halfWithDifference;
			const menuCentredRightPosition = menuCentredLeftPosition + mediaMenu.offsetWidth;

			const bAsText = DOM.HasAttr(Figure, ATTRIBUTE_AS_TEXT);
			const bOutOfBody = bAsText && figureRightPosition > DOM.Doc.body.offsetWidth;

			if (menuCentredLeftPosition < 0 && !bOutOfBody)
				newStyles.left = '0px';
			else if (menuCentredRightPosition > DOM.Doc.body.offsetWidth || bOutOfBody)
				newStyles.left = `${menuCentredLeftPosition + halfWithDifference}px`;
			else
				newStyles.left = `${menuCentredLeftPosition}px`;

			const yRange = DOM.Win.innerHeight + DOM.Win.scrollY;

			const predictMenuBottomSide = Figure.offsetTop + Figure.offsetHeight + mediaMenu.offsetHeight;

			newStyles.top = predictMenuBottomSide <= yRange
				? `${FigureElement.offsetTop + FigureElement.offsetHeight + IMAGE_MENU_ADDABLE_TOP}px`
				: `${FigureElement.offsetTop - mediaMenu.offsetHeight - IMAGE_MENU_ADDABLE_TOP}px`;

			DOM.SetStyles(mediaMenu, newStyles);
		});

	return {
		Create,
		ChangePosition,
	};
};

export default MediaMenu;