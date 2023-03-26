import { Arr, Obj, Str } from '@dynafer/utils';
import Options from '../../../Options';
import { IDOMToolsPartAttacher } from '../../../packages/dom/tools/Types';
import Editor from '../../../packages/Editor';
import ImgStyles from '../format/ImgStyles';
import { IPluginMediaUI } from '../UI';
import { IPluginImageMenuFormatUI } from '../utils/Type';
import { ATTRIBUTE_AS_TEXT, IMAGE_MENU_ADDABLE_TOP } from '../utils/Utils';

export interface IImageMenu {
	Create: IDOMToolsPartAttacher,
	ChangePosition: () => void,
}

const ImageMenu = (editor: Editor, ui: IPluginMediaUI): IImageMenu => {
	const self = editor;
	const DOM = self.DOM;

	const uiFormats: Record<string, IPluginImageMenuFormatUI[]> = {
		Float: [
			{ Name: 'Left', Title: 'Align left with text wrapping', Icon: 'ImageFloatLeft', Styles: { float: 'left' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
			{ Name: 'Right', Title: 'Align right with text wrapping', Icon: 'ImageFloatRight', Styles: { float: 'right' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
		],
		Alignment: [
			{ Name: 'Left', Title: 'Align left with text break', Icon: 'ImageAlignLeft', Styles: { marginLeft: '0px', marginRight: 'auto' }, SameStyles: ['float'] },
			{ Name: 'Center', Title: 'Align center with text break', Icon: 'ImageAlignCenter', Styles: { marginLeft: 'auto', marginRight: 'auto' }, SameStyles: ['float'] },
			{ Name: 'Right', Title: 'Align right with text break', Icon: 'ImageAlignRight', Styles: { marginLeft: 'auto', marginRight: '0px' }, SameStyles: ['float'] },
		]
	};

	const createCommandName = (uiName: string, formatName: string): string => Str.Merge(uiName, ':', formatName);

	const createCommand = (imageMenu: HTMLElement, image: HTMLElement, format: IPluginImageMenuFormatUI, button: HTMLElement) =>
		<T = boolean>(bActive: T) => {
			const toggler = ImgStyles(self, format);
			toggler.Toggle(bActive as boolean, image);

			const otherButtons = DOM.SelectAll({
				class: DOM.Utils.CreateUEID('icon-button', false)
			}, imageMenu);

			Arr.Each(otherButtons, otherButton => DOM.RemoveClass(otherButton, ui.ACTIVE_CLASS));

			const toggleClass = bActive ? DOM.AddClass : DOM.RemoveClass;
			toggleClass(button, ui.ACTIVE_CLASS);
		};

	const createGroup = (imageMenu: HTMLElement, figure: HTMLElement, uiName: string, formats: IPluginImageMenuFormatUI[]): HTMLElement => {
		const group = DOM.Create('div', {
			class: DOM.Utils.CreateUEID('icon-group', false)
		});

		Arr.Each(formats, format => {
			const { Name, Title, Icon } = format;

			const commandName = createCommandName(uiName, Name);

			const button = DOM.Create('button', {
				attrs: {
					title: Title,
				},
				class: DOM.Utils.CreateUEID('icon-button', false),
				html: Finer.Icons.Get(Icon)
			});

			ui.RegisterCommand(self, commandName, createCommand(imageMenu, figure, format, button));

			const eventCallback = () => ui.RunCommand(self, commandName, !DOM.HasClass(button, ui.ACTIVE_CLASS));
			DOM.On(button, Finer.NativeEventMap.click, eventCallback);

			DOM.Insert(group, button);
		});

		return group;
	};

	const Create: IDOMToolsPartAttacher = (e: Editor, image: HTMLElement): HTMLElement | null => {
		const imageMenu = DOM.Create('div', {
			attrs: {
				dataImageMenu: ''
			}
		});

		Obj.Entries(uiFormats, (uiName, formats) => DOM.Insert(imageMenu, createGroup(imageMenu, image, uiName, formats)));

		return imageMenu;
	};

	const ChangePosition = () =>
		Arr.Each(DOM.SelectAll<HTMLElement>({ attrs: ['data-image-menu'] }, self.GetBody()), imageMenu => {
			const { Figure, FigureType, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(imageMenu);
			if (!Figure || !FigureType || !FigureElement) return;

			if (!DOM.HasAttr(Figure, Options.ATTRIBUTE_FOCUSED)) return DOM.Hide(imageMenu);
			DOM.Show(imageMenu);

			const newStyles: Record<string, string> = {};

			const figureRightPosition = Figure.offsetLeft + Figure.offsetWidth;
			const figureElementRightPosition = FigureElement.offsetLeft + FigureElement.offsetWidth;
			const halfWithDifference = (FigureElement.offsetWidth - imageMenu.offsetWidth) / 2;
			const menuCentredLeftPosition = figureElementRightPosition - imageMenu.offsetWidth - halfWithDifference;
			const menuCentredRightPosition = menuCentredLeftPosition + imageMenu.offsetWidth;

			const bAsText = DOM.HasAttr(Figure, ATTRIBUTE_AS_TEXT);
			const bOutOfBody = bAsText && figureRightPosition > DOM.Doc.body.offsetWidth;

			if (menuCentredLeftPosition < 0 && !bOutOfBody)
				newStyles.left = '0px';
			else if (menuCentredRightPosition > DOM.Doc.body.offsetWidth || bOutOfBody)
				newStyles.left = `${menuCentredLeftPosition + halfWithDifference}px`;
			else
				newStyles.left = `${menuCentredLeftPosition}px`;

			const yRange = DOM.Win.innerHeight + DOM.Win.scrollY;

			const predictMenuBottomSide = Figure.offsetTop + Figure.offsetHeight + imageMenu.offsetHeight;

			newStyles.top = predictMenuBottomSide <= yRange
				? `${FigureElement.offsetTop + FigureElement.offsetHeight + IMAGE_MENU_ADDABLE_TOP}px`
				: `${FigureElement.offsetTop - imageMenu.offsetHeight - IMAGE_MENU_ADDABLE_TOP}px`;

			DOM.SetStyles(imageMenu, newStyles);
		});

	return {
		Create,
		ChangePosition,
	};
};

export default ImageMenu;