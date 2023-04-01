import { Arr, Str, Type } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { ENativeEvents, PreventEvent } from '../events/EventSetupUtils';
import { EKeyCode, SetupWith } from '../events/keyboard/KeyboardUtils';
import { Formats, ListItemSelector } from './Format';
import ToggleInline from './format/ToggleInline';
import { IInlineFormat } from './FormatType';

export interface IFormatUISelection {
	readonly Label: HTMLElement,
	readonly Selection: HTMLElement,
}

export interface IFormatUIInputWrap {
	readonly Wrapper: HTMLElement,
	readonly Input: HTMLInputElement,
	readonly Placeholder: HTMLElement,
}

export interface IFormatUIInputWrapOptions {
	uiName: string,
	placeholder: string,
	bUpdatable: boolean,
	createCallback: (input: HTMLInputElement) => void,
	src?: string,
}

export interface IFormatUIInputWrapWithOptionList {
	readonly OptionWrapper: HTMLElement,
	readonly Input: HTMLInputElement,
}

export interface IFormatUI {
	readonly ACTIVE_CLASS: string,
	readonly DISABLED_ATTRIBUTE: string,
	Create: (opts: Record<string, string>) => HTMLElement,
	GetSystemStyle: (editor: Editor, style: string) => string,
	CreateIconButton: (title: string, iconName: string) => HTMLElement,
	CreateSelection: (title: string, labelText?: string) => IFormatUISelection,
	CreateOption: (html: string, title?: string, bSelected?: boolean, bAddIcon?: boolean) => HTMLElement,
	CreateOptionList: (type: string, items?: HTMLElement[]) => HTMLElement,
	CreateItemGroup: () => HTMLElement,
	CreateIconGroup: () => HTMLElement,
	CreateIconWrap: (title: string) => HTMLElement,
	CreateHelper: (title: string) => HTMLElement,
	CreateInputWrap: (placeholder?: string) => IFormatUIInputWrap,
	CreateInputWrapWithOptionList: (opts: IFormatUIInputWrapOptions) => IFormatUIInputWrapWithOptionList,
	ToggleActivateClass: (selector: HTMLElement, bActive: boolean) => void,
	HasActiveClass: (selector: HTMLElement) => boolean,
	ToggleDisable: (selector: HTMLElement, bDisable: boolean) => void,
	IsDisabled: (selector: HTMLElement) => boolean,
	BindOptionListEvent: (editor: Editor, type: string, activable: HTMLElement, clickable: HTMLElement, create: () => void) => void,
	SetOptionListCoordinate: (editor: Editor, name: string, selection: HTMLElement, optionList: HTMLElement) => void,
	BindClickEvent: (selector: HTMLElement, callback: () => void) => void,
	UnwrapSameInlineFormats: (editor: Editor, formats: IInlineFormat | IInlineFormat[]) => void,
	RegisterCommand: (editor: Editor, name: string, command: <T>(...args: T[]) => void) => void,
	RunCommand: <T>(editor: Editor, name: string, ...args: T[]) => void,
	RegisterKeyboardEvent: (editor: Editor, combinedKeys: string, callback: (editor: Editor, event: Event) => void) => void,
	IsNearDisableList: (editor: Editor, disableList: Set<string> | undefined, selector: HTMLElement, path: Node) => boolean,
}

const FormatUI = (): IFormatUI => {
	const optionsActivableList: HTMLElement[] = [];

	const ACTIVE_CLASS = 'active';
	const DISABLED_ATTRIBUTE = 'disabled';

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
			tagName: ListItemSelector,
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

	const CreateIconWrap = (title: string): HTMLElement => Create({
		tagName: 'button',
		title,
		type: 'icon-wrap',
	});

	const CreateHelper = (title: string): HTMLElement => Create({
		tagName: 'button',
		title,
		type: 'helper',
		html: Finer.Icons.Get('AngleDown')
	});

	const CreateInputWrap = (placeholder: string = ''): IFormatUIInputWrap => {
		const Wrapper = Create({
			tagName: 'div',
			type: 'input-wrap'
		});

		const Input = DOM.Create('input', {
			attrs: [
				{ type: 'text' },
				'required'
			]
		});

		const Placeholder = Create({
			tagName: 'span',
			type: 'input-placeholder',
			html: placeholder
		});

		DOM.Insert(Wrapper, Input, Placeholder);

		return {
			Wrapper,
			Input,
			Placeholder,
		};
	};

	const CreateInputWrapWithOptionList = (opts: IFormatUIInputWrapOptions): IFormatUIInputWrapWithOptionList => {
		const { uiName, placeholder, bUpdatable, createCallback, src } = opts;
		const OptionWrapper = CreateOptionList(uiName);
		DOM.SetAttr(OptionWrapper, 'media-url', 'true');
		DOM.On(OptionWrapper, Finer.NativeEventMap.click, event => Finer.PreventEvent(event));

		const { Wrapper, Input } = CreateInputWrap(placeholder);
		if (src) Input.value = src;

		const callback = () => {
			createCallback(Input);
			DOM.Doc.body.click();
		};

		DOM.On(Input, Finer.NativeEventMap.keyup, e => {
			const event = e as KeyboardEvent;
			if (event.key !== Finer.KeyCode.Enter && event.code !== Finer.KeyCode.Enter) return;
			callback();
		});

		const buttonGroup = Create({
			tagName: 'div',
			type: 'button-group'
		});

		const cancelButton = Create({
			tagName: 'button',
			title: 'Cancel',
			html: 'Cancel'
		});
		DOM.On(cancelButton, Finer.NativeEventMap.click, () => DOM.Doc.body.click());

		const insertButton = Create({
			tagName: 'button',
			title: !bUpdatable ? 'Insert' : 'Update',
			html: !bUpdatable ? 'Insert' : 'Update'
		});
		DOM.On(insertButton, Finer.NativeEventMap.click, callback);

		DOM.Insert(buttonGroup, cancelButton, insertButton);
		DOM.Insert(OptionWrapper, Wrapper, buttonGroup);

		return {
			OptionWrapper,
			Input,
		};
	};

	const ToggleActivateClass = (selector: HTMLElement, bActive: boolean) => {
		const toggle = bActive ? DOM.AddClass : DOM.RemoveClass;
		toggle(selector, ACTIVE_CLASS);
	};

	const HasActiveClass = (selector: HTMLElement): boolean => DOM.HasClass(selector, ACTIVE_CLASS);

	const ToggleDisable = (selector: HTMLElement, bDisable: boolean) => {
		const toggle = bDisable ? DOM.SetAttr : DOM.RemoveAttr;
		toggle(selector, DISABLED_ATTRIBUTE, DISABLED_ATTRIBUTE);
	};

	const IsDisabled = (selector: HTMLElement): boolean =>
		DOM.HasAttr(selector, DISABLED_ATTRIBUTE) || DOM.HasAttr(selector.parentElement, DISABLED_ATTRIBUTE);

	const BindOptionListEvent = (editor: Editor, type: string, activable: HTMLElement, clickable: HTMLElement, create: () => void) => {
		const self = editor;

		const selectOptionList = (): Element | null => DOM.Select({
			class: DOM.Utils.CreateUEID('options', false)
		}, self.Frame.Root);
		const hasTypeAttribute = (): boolean => !!selectOptionList() && DOM.GetAttr(selectOptionList(), 'data-type') === type;
		const toggleEvents = (bOn: boolean, event: () => void) => {
			Arr.Each(optionsActivableList, activableItem => ToggleActivateClass(activableItem, false));
			ToggleActivateClass(activable, bOn);
			const toggleRoot = bOn ? DOM.On : DOM.Off;
			const toggleEditor = bOn ? self.DOM.On : self.DOM.Off;
			toggleRoot(self.Frame.Toolbar, ENativeEvents.scroll, event);
			toggleRoot(DOM.Win, ENativeEvents.click, event);
			toggleEditor(self.DOM.Win, ENativeEvents.click, event);
			toggleRoot(DOM.Win, ENativeEvents.scroll, event);
			toggleRoot(DOM.Win, ENativeEvents.resize, event);
		};

		const destroyOptionList = () => {
			toggleEvents(false, destroyOptionList);
			DOM.Remove(selectOptionList(), true);
		};

		Arr.Push(optionsActivableList, activable);

		DOM.On(clickable, ENativeEvents.click, (event: MouseEvent) => {
			if (!!selectOptionList() && hasTypeAttribute()) return destroyOptionList();
			PreventEvent(event);

			destroyOptionList();
			if (IsDisabled(clickable)) return;
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
		DOM.On(selector, ENativeEvents.click, () => {
			if (IsDisabled(selector)) return;
			callback();
		});

	const UnwrapSameInlineFormats = (editor: Editor, formats: IInlineFormat | IInlineFormat[]) => {
		const unwrap = (format: IInlineFormat) => {
			const { SameFormats } = format;
			if (!SameFormats) return;
			Arr.Each(SameFormats, sameFormat => {
				const toggler = ToggleInline(editor, Formats[sameFormat] as IInlineFormat);
				toggler.ToggleFromCaret(false);
			});
		};

		if (!Type.IsArray(formats)) return unwrap(formats);

		Arr.Each(formats, format => unwrap(format));
	};

	const RegisterCommand = (editor: Editor, name: string, command: <T>(...args: T[]) => void) =>
		editor.Commander.Register(name, command);

	const RunCommand = <T>(editor: Editor, name: string, ...args: T[]) =>
		editor.Commander.Run(name, ...args);

	const RegisterKeyboardEvent = (editor: Editor, combinedKeys: string, callback: (editor: Editor, event: Event) => void) => {
		const self = editor;

		const keys = combinedKeys.split('+');

		const keyOptions = {
			bCtrl: false,
			bAlt: false,
			bShift: false,
			bPrevent: true,
		};
		let keyCode;

		Arr.Each(keys, key => {
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
					const keyName: EKeyCode = (lowercase.length === 1
						? Str.Merge(isNaN(parseInt(lowercase)) ? 'Key' : 'Digit', Str.UpperCase(lowercase))
						: key) as EKeyCode;
					keyCode = EKeyCode[keyName];
					break;
			}
		});

		if (keyCode) SetupWith(self, ENativeEvents.keydown, keyCode, keyOptions, callback);
	};

	const IsNearDisableList = (editor: Editor, disableList: Set<string> | undefined, selector: HTMLElement, path: Node): boolean => {
		const self = editor;

		if (!disableList) {
			ToggleDisable(selector, false);
			return false;
		}
		const disableListSelector = Str.Join(',', ...disableList);
		const figure = self.DOM.Closest(path, disableListSelector);
		if (!figure) {
			ToggleDisable(selector, false);
			return false;
		}

		ToggleActivateClass(selector, false);
		ToggleDisable(selector, true);
		return true;
	};

	return {
		ACTIVE_CLASS,
		DISABLED_ATTRIBUTE,
		Create,
		GetSystemStyle,
		CreateIconButton,
		CreateSelection,
		CreateOption,
		CreateOptionList,
		CreateItemGroup,
		CreateIconGroup,
		CreateIconWrap,
		CreateHelper,
		CreateInputWrap,
		CreateInputWrapWithOptionList,
		ToggleActivateClass,
		HasActiveClass,
		ToggleDisable,
		IsDisabled,
		BindOptionListEvent,
		SetOptionListCoordinate,
		BindClickEvent,
		UnwrapSameInlineFormats,
		RegisterCommand,
		RunCommand,
		RegisterKeyboardEvent,
		IsNearDisableList,
	};
};

export default FormatUI();