import { Str, Type } from '@dynafer/utils';
import Editor from '../Editor';
import DOM from '../dom/DOM';
import { ENativeEvents, PreventEvent } from '../events/EventSetupUtils';
import { EKeyCode, SetupWith } from '../events/keyboard/KeyboardUtils';
import { IInlineFormat } from './FormatType';
import ToggleInline from './format/ToggleInline';
import { Formats } from './Format';

const ACTIVE_CLASS = 'active';
const DISABLED_ATTRIBUTE = 'disabled';

export interface IFormatUISelection {
	Label: HTMLElement,
	Selection: HTMLElement,
}

export interface IFormatUI {
	Create: (opts: Record<string, string>) => HTMLElement,
	GetSystemStyle: (editor: Editor, style: string) => string,
	CreateIconButton: (title: string, iconName: string) => HTMLElement,
	CreateSelection: (title: string, labelText?: string) => IFormatUISelection,
	CreateOption: (html: string, title?: string, bSelected?: boolean, bAddIcon?: boolean) => HTMLElement,
	CreateOptionList: (type: string, items?: HTMLElement[]) => HTMLElement,
	CreateItemGroup: () => HTMLElement,
	CreateIconGroup: () => HTMLElement,
	CreateHelper: (title: string) => HTMLElement,
	BindOptionListEvent: (editor: Editor, type: string, clickable: HTMLElement, create: () => void) => void,
	SetOptionListCoordinate: (editor: Editor, name: string, selection: HTMLElement, optionList: HTMLElement) => void,
	BindClickEvent: (selector: HTMLElement, callback: () => void) => void,
	ToggleActivateClass: (selector: HTMLElement, bActive: boolean) => void,
	ToggleDisable: (selector: HTMLElement, bDisable: boolean) => void,
	HasActiveClass: (selector: HTMLElement) => boolean,
	UnwrapSameInlineFormats: (editor: Editor, formats: IInlineFormat | IInlineFormat[]) => void,
	RegisterCommand: (editor: Editor, name: string, command: <T>(...args: T[]) => void) => void,
	RunCommand: <T>(editor: Editor, name: string, ...args: T[]) => void,
	RegisterKeyboardEvent: (editor: Editor, combinedKeys: string, callback: () => void) => void,
}

const FormatUI = (): IFormatUI => {
	const GetSystemStyle = (editor: Editor, style: string): string => editor.DOM.GetStyle(editor.GetBody(), style);

	const Create = (opts: Record<string, string>): HTMLElement => {
		const { tagName, title, type, html } = opts;
		const createOption: Record<string, string | Record<string, string>> = {
			attrs: {},
		};

		if (!!title) (createOption.attrs as Record<string, string>).title = title;
		if (!!type) createOption.class = DOM.Utils.CreateUEID(type, false);
		if (!!html) createOption.html = html;

		return DOM.Create(tagName, createOption);
	};

	const CreateIconButton = (title: string, iconName: string): HTMLElement =>
		Create({
			tagName: 'button',
			title,
			type: 'icon-button',
			html: Finer.Icons.Get(iconName),
		});

	const CreateSelection = (title: string, labelText: string = ''): IFormatUISelection => {
		const Label = Create({
			tagName: 'div',
			type: 'select-label',
			html: labelText
		});

		const Selection = Create({
			tagName: 'button',
			title,
			type: 'select'
		});
		DOM.Insert(Selection, Label, Finer.Icons.Get('AngleDown'));

		return {
			Label,
			Selection,
		};
	};

	const CreateOption = (html: string, title?: string, bSelected: boolean = false, bAddIcon: boolean = true): HTMLElement => {
		const option = Create({
			tagName: 'li',
			title: title ?? html,
			type: 'option-item',
			html: Str.Merge(bAddIcon ? Finer.Icons.Get('Check') : '', html)
		});
		if (bSelected) DOM.AddClass(option, ACTIVE_CLASS);
		return option;
	};

	const CreateOptionList = (type: string, items: HTMLElement[] = []): HTMLElement => {
		const optionList = Create({
			tagName: 'div',
			type: 'options'
		});
		DOM.SetAttr(optionList, 'data-type', type);
		DOM.Insert(optionList, ...items);
		return optionList;
	};

	const CreateItemGroup = (): HTMLElement => Create({
		tagName: 'div',
		type: 'item-group'
	});

	const CreateIconGroup = (): HTMLElement => Create({
		tagName: 'div',
		type: 'icon-group'
	});

	const CreateHelper = (title: string): HTMLElement => Create({
		tagName: 'div',
		title,
		type: 'helper',
		html: Finer.Icons.Get('AngleDown')
	});

	const BindOptionListEvent = (editor: Editor, type: string, clickable: HTMLElement, create: () => void) => {
		const self = editor;

		const selectOptionList = (): Element | null => DOM.Select({
			class: DOM.Utils.CreateUEID('options', false)
		}, self.Frame.Root);
		const hasTypeAttribute = (): boolean => !!selectOptionList() && DOM.GetAttr(selectOptionList(), 'data-type') === type;
		const toggleEvents = (bOn: boolean, event: () => void) => {
			const toggleRoot = bOn ? DOM.On : DOM.Off;
			const toggleEditor = bOn ? self.DOM.On : self.DOM.Off;
			toggleRoot(self.Frame.Toolbar, ENativeEvents.scroll, event);
			toggleRoot(DOM.Doc.body, ENativeEvents.click, event);
			toggleEditor(self.DOM.GetRoot(), ENativeEvents.click, event);
			toggleRoot(DOM.Win, ENativeEvents.scroll, event);
			toggleRoot(DOM.Win, ENativeEvents.resize, event);
		};

		const destroyOptionList = () => {
			toggleEvents(false, destroyOptionList);
			DOM.Remove(selectOptionList(), true);
		};

		DOM.On(clickable, ENativeEvents.click, (event: MouseEvent) => {
			if (!!selectOptionList() && hasTypeAttribute()) return destroyOptionList();
			PreventEvent(event);

			destroyOptionList();
			create();
			toggleEvents(true, destroyOptionList);
		});
	};

	const SetOptionListCoordinate = (editor: Editor, name: string, selection: HTMLElement, optionList: HTMLElement) => {
		const self = editor;

		const bInGroup = self.Toolbar.IsInGroup(name);
		const browserWidth = DOM.Win.innerWidth + DOM.Win.scrollX;
		const browserHeight = DOM.Win.innerHeight + DOM.Win.scrollY;
		const groupLeft = selection.parentElement && DOM.HasAttr(selection.parentElement, 'group') ? selection.parentElement.offsetLeft : 0;
		let x = selection.offsetLeft + groupLeft - self.Frame.Toolbar.scrollLeft
			+ (bInGroup ? parseInt(DOM.GetStyle(selection, 'margin-left')) : 0);
		let y = selection.offsetHeight + selection.offsetTop
			+ parseInt(DOM.GetStyle(selection, 'margin-bottom'));

		if (x + optionList.offsetWidth >= browserWidth) {
			x -= Math.max(optionList.offsetWidth, selection.offsetWidth)
				- Math.min(optionList.offsetWidth, selection.offsetWidth);
		}

		if (y + optionList.offsetHeight + self.Frame.Root.offsetTop >= browserHeight) {
			y -= selection.offsetHeight + optionList.offsetHeight
				+ parseInt(DOM.GetStyle(selection, 'margin-bottom'));
		}

		DOM.SetStyles(optionList, {
			left: `${x}px`,
			top: `${y}px`
		});
	};

	const BindClickEvent = (selector: HTMLElement, callback: () => void) =>
		DOM.On(selector, ENativeEvents.click, callback);

	const ToggleActivateClass = (selector: HTMLElement, bActive: boolean) => {
		const toggle = bActive ? DOM.AddClass : DOM.RemoveClass;
		toggle(selector, ACTIVE_CLASS);
	};

	const ToggleDisable = (selector: HTMLElement, bDisable: boolean) => {
		if (bDisable) {
			DOM.SetAttr(selector, DISABLED_ATTRIBUTE, DISABLED_ATTRIBUTE);
			return;
		}

		DOM.RemoveAttr(selector, DISABLED_ATTRIBUTE);
	};

	const HasActiveClass = (selector: HTMLElement): boolean => DOM.HasClass(selector, ACTIVE_CLASS);

	const UnwrapSameInlineFormats = (editor: Editor, formats: IInlineFormat | IInlineFormat[]) => {
		const unwrap = (format: IInlineFormat) => {
			const { SameFormats } = format;
			if (!SameFormats) return;
			for (const sameFormat of SameFormats) {
				const toggler = ToggleInline(editor, Formats[sameFormat] as IInlineFormat);
				toggler.ToggleFromCaret(false);
			}
		};

		if (!Type.IsArray(formats)) return unwrap(formats);

		for (const format of formats) {
			unwrap(format);
		}
	};

	const RegisterCommand = (editor: Editor, name: string, command: <T>(...args: T[]) => void) =>
		editor.Commander.Register(name, command);

	const RunCommand = <T>(editor: Editor, name: string, ...args: T[]) =>
		editor.Commander.Run(name, ...args);

	const RegisterKeyboardEvent = (editor: Editor, combinedKeys: string, callback: () => void) => {
		const self = editor;

		const keys = combinedKeys.split('+');

		const keyOptions = {
			bCtrl: false,
			bAlt: false,
			bShift: false,
			bPrevent: true,
		};
		let keyCode;

		for (const key of keys) {
			const lowercase = Str.LowerCase(key);
			switch (lowercase) {
				case 'ctrl':
					keyOptions.bCtrl = true;
					break;
				case 'alt':
					keyOptions.bAlt = true;
					break;
				case 'shift':
					keyOptions.bShift = true;
					break;
				default:
					keyCode = lowercase.length === 1
						? EKeyCode[Str.Merge(
							isNaN(parseInt(lowercase)) ? 'Key' : 'Digit',
							Str.UpperCase(lowercase)
						)]
						: EKeyCode[key];
					break;
			}
		}

		SetupWith(self, ENativeEvents.keydown, keyCode, keyOptions, callback);
	};

	return {
		Create,
		GetSystemStyle,
		CreateIconButton,
		CreateSelection,
		CreateOption,
		CreateOptionList,
		CreateItemGroup,
		CreateIconGroup,
		CreateHelper,
		BindOptionListEvent,
		SetOptionListCoordinate,
		BindClickEvent,
		ToggleActivateClass,
		ToggleDisable,
		HasActiveClass,
		UnwrapSameInlineFormats,
		RegisterCommand,
		RunCommand,
		RegisterKeyboardEvent,
	};
};

export default FormatUI();