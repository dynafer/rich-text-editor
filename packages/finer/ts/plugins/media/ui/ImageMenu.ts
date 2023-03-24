import { Arr, Obj, Str } from '@dynafer/utils';
import { IDOMToolsPartAttacher } from '../../../packages/dom/tools/Types';
import Editor from '../../../packages/Editor';
import ImgStyles from '../format/ImgStyles';
import { IPluginMediaUI } from '../UI';
import { IPluginImageMenuFormatUI } from '../utils/Type';
import { IMAGE_MENU_ADDABLE_TOP } from '../utils/Utils';

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

	const createCommand = (figure: HTMLElement, format: IPluginImageMenuFormatUI, button: HTMLElement) =>
		<T = boolean>(bActive: T) => {
			const toggler = ImgStyles(self, format);
			toggler.Toggle(bActive as boolean);
			const toggleClass = bActive ? DOM.AddClass : DOM.RemoveClass;
			toggleClass(button, ui.ACTIVE_CLASS);
		};

	const createGroup = (figure: HTMLElement, uiName: string, formats: IPluginImageMenuFormatUI[]): HTMLElement => {
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

			ui.RegisterCommand(self, commandName, createCommand(figure, format, button));

			const eventCallback = () => ui.RunCommand(self, commandName, !DOM.HasClass(button, ui.ACTIVE_CLASS));
			DOM.On(button, Finer.NativeEventMap.click, eventCallback);

			DOM.Insert(group, button);
		});

		return group;
	};

	const Create: IDOMToolsPartAttacher = (e: Editor, img: HTMLElement): HTMLElement | null => {
		const image = img as HTMLImageElement;
		const figure = image.parentNode as HTMLElement;

		const imageMenu = DOM.Create('div', {
			attrs: {
				dataImageMenu: ''
			}
		});

		Obj.Entries(uiFormats, (uiName, formats) => DOM.Insert(imageMenu, createGroup(figure, uiName, formats)));

		return imageMenu;
	};

	const ChangePosition = () =>
		Arr.Each(DOM.SelectAll({ attrs: ['data-image-menu'] }, self.GetBody()), imageMenu => {
			const { Figure, FigureType, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(imageMenu);
			if (!Figure || !FigureType || !FigureElement) return;

			const newStyles: Record<string, string> = {};
			const figureRightPosition = FigureElement.offsetLeft + FigureElement.offsetWidth;
			const menuCenterPosition = figureRightPosition - imageMenu.offsetWidth - (FigureElement.offsetWidth - imageMenu.offsetWidth) / 2;
			if (menuCenterPosition < 0) newStyles.left = '0px';
			else if (menuCenterPosition > figureRightPosition) newStyles.left = `${figureRightPosition}px`;
			else newStyles.left = `${menuCenterPosition}px`;

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