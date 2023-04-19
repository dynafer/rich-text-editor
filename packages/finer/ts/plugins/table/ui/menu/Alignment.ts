import { Arr, Obj, Type } from '@dynafer/utils';
import Options from '../../../../Options';
import Editor from '../../../../packages/Editor';
import { IPluginTableMenuFormatUI } from '../../Type';
import { COMMAND_NAMES_MAP, GetMenuText, STYLE_COMMANDS } from '../../Utils';

const Alignment = (editor: Editor, table: HTMLElement, tableMenu: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;
	const detector = self.Formatter.Detector;
	const formatUI = self.Formatter.UI;

	const uiTitle = GetMenuText('table.alignment', 'Align a table');
	const uiType = 'TableAlignment';

	const uiFormats: Record<string, IPluginTableMenuFormatUI[]> = {
		Float: [
			{ Title: GetMenuText('floatLeft', 'Align left with text wrapping'), CommandName: COMMAND_NAMES_MAP.FLOAT_LEFT, Icon: 'MediaFloatLeft' },
			{ Title: GetMenuText('floatRight', 'Align right with text wrapping'), CommandName: COMMAND_NAMES_MAP.FLOAT_RIGHT, Icon: 'MediaFloatRight' },
		],
		Alignment: [
			{ Title: GetMenuText('alignLeft', 'Align left with text break'), CommandName: COMMAND_NAMES_MAP.ALIGN_LEFT, Icon: 'MediaAlignLeft' },
			{ Title: GetMenuText('alignCenter', 'Align center with text break'), CommandName: COMMAND_NAMES_MAP.ALIGN_CENTER, Icon: 'MediaAlignCenter' },
			{ Title: GetMenuText('alignRight', 'Align right with text break'), CommandName: COMMAND_NAMES_MAP.ALIGN_RIGHT, Icon: 'MediaAlignRight' },
		]
	};

	const findFormat = (element: Element | null): IPluginTableMenuFormatUI => {
		if (!element) return uiFormats.Alignment[0];

		let foundFormat: IPluginTableMenuFormatUI | null = null;

		const { Figure } = DOM.Element.Figure.Find(element);
		if (!Figure) return uiFormats.Alignment[0];

		Arr.Each(STYLE_COMMANDS, (format, exit) => {
			const { Name, Styles, bAsText } = format;
			if (bAsText && !DOM.HasAttr(Figure, Options.ATTRIBUTE_AS_TEXT)) return;

			let bSameFormat: boolean | null = null;

			Obj.Entries(Styles, (styleName, styleValue) => {
				if (!Type.IsBoolean(bSameFormat)) {
					bSameFormat = DOM.HasStyle(Figure, styleName, styleValue);
					return;
				}

				bSameFormat = bSameFormat && DOM.HasStyle(Figure, styleName, styleValue);
			});

			if (!bSameFormat) return;

			Obj.Values(uiFormats, uiFormatList => Arr.Each(uiFormatList, (uiFormat, exitFinding) => {
				if (uiFormat.CommandName !== Name) return;
				foundFormat = uiFormat;
				exitFinding();
			}));

			exit();
		});

		return foundFormat ?? uiFormats.Alignment[0];
	};

	const createOptions = (options: HTMLElement, formats: IPluginTableMenuFormatUI[], activeFormat: IPluginTableMenuFormatUI): HTMLElement[] => {
		const icons: HTMLElement[] = [];

		Arr.Each(formats, format => {
			const { Title, CommandName, Icon } = format;

			const button = formatUI.CreateIconButton(Title, Icon);

			if (activeFormat.CommandName === CommandName) formatUI.ToggleActivateClass(button, true);

			formatUI.BindClickEvent(button, () => {
				const bActive = !formatUI.HasActiveClass(button);
				self.Commander.Run<boolean | Node>(CommandName, bActive, button);

				const otherButtons = DOM.SelectAll<HTMLElement>({
					class: DOM.Utils.CreateUEID('icon-button', false)
				}, options);

				Arr.Each(otherButtons, otherButton => formatUI.ToggleActivateClass(otherButton, false));

				formatUI.ToggleActivateClass(button, bActive);
			});

			Arr.Push(icons, button);
		});

		return icons;
	};

	const createOptionList = (uiName: string, wrapper: HTMLElement): HTMLElement => {
		const options = formatUI.CreateOptionList(uiName);
		DOM.SetAttr(options, 'icon-group', 'true');

		const foundFormat = findFormat(wrapper);

		Obj.Values(uiFormats, formats => {
			const group = DOM.Create('div', {
				class: DOM.Utils.CreateUEID('icon-group', false)
			});

			DOM.Insert(group, ...createOptions(options, formats, foundFormat));

			DOM.Insert(options, group);
		});

		return options;
	};

	const group = DOM.Create('div', {
		class: DOM.Utils.CreateUEID('icon-group', false)
	});

	const firstFormat = findFormat(table);
	const { Wrapper, Button } = formatUI.CreateIconWrapSet(uiTitle, firstFormat.Icon);
	DOM.SetAttr(Button, 'data-icon', firstFormat.Icon);
	DOM.SetAttrs(Wrapper, [
		'no-border',
		{ dataType: uiType }
	]);

	formatUI.BindOptionListEvent(self, {
		type: uiType,
		activable: Wrapper,
		clickable: Wrapper,
		create: () => {
			const optionList = createOptionList(uiType, Wrapper);
			DOM.Insert(tableMenu, optionList);
			formatUI.SetOptionListInToolsMenuCoordinate(self, Wrapper, optionList);
		},
		root: tableMenu
	});

	detector.Register(() => {
		const foundFormat = findFormat(Wrapper);
		if (DOM.GetAttr(Button, 'data-icon') === foundFormat.Icon) return;
		DOM.SetAttr(Button, 'data-icon', foundFormat.Icon);
		DOM.SetHTML(Button, Finer.Icons.Get(foundFormat.Icon));
	});

	DOM.Insert(group, Wrapper);

	return group;
};

export default Alignment;