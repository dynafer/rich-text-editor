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
	bUpdatable: boolean,
	createCallback: (input: HTMLInputElement) => void,
	removeCallback?: () => void,
	src?: string,
	texts: {
		placeholder: string,
		cancel: string,
		insert: string,
		update: string,
		remove: string,
	};
}

export interface IFormatUIIconWrapSet {
	readonly Wrapper: HTMLElement,
	readonly Button: HTMLElement,
	readonly Helper: HTMLElement,
}

export interface IFormatUIInputWrapWithOptionList {
	readonly OptionWrapper: HTMLElement,
	readonly Input: HTMLInputElement,
}

export interface IFormatUIBindOptionList {
	type: string,
	activable: HTMLElement,
	clickable: HTMLElement,
	create: () => HTMLElement,
	root?: HTMLElement,
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
	CreateIconWrapSet: (title: string, icon: string) => IFormatUIIconWrapSet,
	CreateInputWrap: (placeholder?: string) => IFormatUIInputWrap,
	ToggleActivateClass: (selector: HTMLElement, bActive: boolean) => void,
	HasActiveClass: (selector: HTMLElement) => boolean,
	ToggleDisable: (selector: HTMLElement, bDisable: boolean) => void,
	IsDisabled: (selector: HTMLElement) => boolean,
	BindClickEvent: (selector: HTMLElement, callback: () => void) => void,
	DestoryOpenedOptionList: (editor: Editor) => void,
	CreateInputWrapWithOptionList: (editor: Editor, opts: IFormatUIInputWrapOptions) => IFormatUIInputWrapWithOptionList,
	BindOptionListEvent: (editor: Editor, opts: IFormatUIBindOptionList) => void,
	SetOptionListCoordinate: (editor: Editor, name: string, selection: HTMLElement, optionList: HTMLElement) => void,
	SetOptionListInToolsMenuCoordinate: (editor: Editor, selection: HTMLElement, optionList: HTMLElement) => void,
	UnwrapSameInlineFormats: (editor: Editor, formats: IInlineFormat | IInlineFormat[]) => void,
	RegisterCommand: (editor: Editor, name: string, command: (...args: never[]) => void) => void,
	RunCommand: <T>(editor: Editor, name: string, ...args: T[]) => void,
	RegisterKeyboardEvent: (editor: Editor, combinedKeys: string, callback: (event: Event) => void) => void,
	IsNearDisableList: (disableList: Set<string> | undefined, selector: HTMLElement, path: Node) => boolean,
}

const FormatUI = (): IFormatUI => {
	const optionsActivableList: HTMLElement[] = [];
	const currentOpenedOptions: [HTMLElement, () => void][] = [];

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
			html: Str.Merge(html, bAddIcon ? Finer.Icons.Get('Check') : '')
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

	const CreateIconWrapSet = (title: string, icon: string): IFormatUIIconWrapSet => {
		const Wrapper = CreateIconWrap(title);
		const Button = CreateIconButton(title, icon);
		const Helper = CreateHelper(title);

		DOM.Insert(Wrapper, Button, Helper);

		return {
			Wrapper,
			Button,
			Helper,
		};
	};

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

	const BindClickEvent = (selector: HTMLElement, callback: () => void) =>
		DOM.On(selector, ENativeEvents.click, event => {
			if (IsDisabled(selector)) return;
			PreventEvent(event);
			callback();
		});

	const DestoryOpenedOptionList = (editor: Editor) => {
		const self = editor;

		Arr.WhileShift(currentOpenedOptions, ([target, event]) => {
			DOM.Remove(target, true);
			DOM.Off(self.GetWin(), ENativeEvents.click, event);
			DOM.Off(window, ENativeEvents.click, event);
			DOM.Off(window, ENativeEvents.scroll, event);
			DOM.Off(window, ENativeEvents.resize, event);
		});

		Arr.Each(optionsActivableList, activableItem => ToggleActivateClass(activableItem, false));
	};

	const CreateInputWrapWithOptionList = (editor: Editor, opts: IFormatUIInputWrapOptions): IFormatUIInputWrapWithOptionList => {
		const self = editor;

		const { uiName, bUpdatable, createCallback, removeCallback, src, texts } = opts;
		const OptionWrapper = CreateOptionList(uiName);
		DOM.SetAttr(OptionWrapper, 'url-input', 'true');
		DOM.On(OptionWrapper, ENativeEvents.click, event => Finer.PreventEvent(event));

		const { Wrapper, Input } = CreateInputWrap(texts.placeholder);
		if (src) Input.value = src;

		const callback = () => {
			if (Str.IsEmpty(Input.value)) return Input.focus();

			DestoryOpenedOptionList(self);
			createCallback(Input);
		};

		DOM.On(Input, ENativeEvents.keyup, event => {
			if (event.key !== Finer.KeyCode.Enter && event.code !== Finer.KeyCode.Enter) return;
			PreventEvent(event);
			callback();
		});

		const buttonGroup = Create({
			tagName: 'div',
			type: 'button-group'
		});

		const buttons: HTMLElement[] = [];

		const cancelButton = Create({
			tagName: 'button',
			title: texts.cancel,
			html: Str.Merge(Finer.Icons.Get('Close'), texts.cancel)
		});
		DOM.On(cancelButton, ENativeEvents.click, () => DestoryOpenedOptionList(self));
		Arr.Push(buttons, cancelButton);

		const insertText = !bUpdatable ? texts.insert : texts.update;
		const insertButton = Create({
			tagName: 'button',
			title: insertText,
			html: Str.Merge(Finer.Icons.Get('Check'), insertText)
		});
		BindClickEvent(insertButton, callback);
		Arr.Push(buttons, insertButton);

		if (bUpdatable && Type.IsFunction(removeCallback)) {
			const removeText = texts.remove;
			const removeButton = Create({
				tagName: 'button',
				title: removeText,
				html: Str.Merge(Finer.Icons.Get('Trash'), removeText)
			});
			DOM.On(removeButton, ENativeEvents.click, () => {
				DestoryOpenedOptionList(self);
				removeCallback();
			});
			Arr.Push(buttons, removeButton);
		}

		DOM.Insert(buttonGroup, ...buttons);
		DOM.Insert(OptionWrapper, Wrapper, buttonGroup);

		return {
			OptionWrapper,
			Input,
		};
	};

	const BindOptionListEvent = (editor: Editor, opts: IFormatUIBindOptionList) => {
		const self = editor;

		const { type, activable, clickable, create, root } = opts;

		const selectOptionList = (): Element | null => DOM.Select({
			class: DOM.Utils.CreateUEID('options', false)
		}, root ?? self.Frame.Root);
		const hasTypeAttribute = (): boolean => !!selectOptionList() && DOM.GetAttr(selectOptionList(), 'data-type') === type;

		const destroyOptionList = () => DestoryOpenedOptionList(self);

		Arr.Push(optionsActivableList, activable);

		DOM.On(clickable, ENativeEvents.click, (event: MouseEvent) => {
			if (hasTypeAttribute()) return destroyOptionList();

			PreventEvent(event);
			destroyOptionList();
			if (IsDisabled(clickable)) return;

			ToggleActivateClass(activable, true);
			const optionList = create();
			DOM.On(self.GetWin(), ENativeEvents.click, destroyOptionList);
			DOM.On(window, ENativeEvents.click, destroyOptionList);
			DOM.On(window, ENativeEvents.scroll, destroyOptionList);
			DOM.On(window, ENativeEvents.resize, destroyOptionList);
			Arr.Push(currentOpenedOptions, [optionList, destroyOptionList]);
		});
	};

	const SetOptionListCoordinate = (editor: Editor, name: string, selection: HTMLElement, optionList: HTMLElement) => {
		const self = editor;

		const bInGroup = self.Toolbar.IsInGroup(name);
		const browserWidth = window.innerWidth + window.scrollX;
		const browserHeight = window.innerHeight + window.scrollY;
		let x = selection.offsetLeft + self.Frame.Toolbar.scrollLeft
			+ (bInGroup ? parseInt(DOM.GetStyle(selection, 'margin-left')) : 0);
		let y = selection.offsetTop + selection.offsetHeight;

		const group = selection.parentElement;
		if (group && DOM.HasAttr(group, 'group')) {
			x += group.offsetLeft;
			y += group.offsetTop;
		}

		if (x + optionList.offsetWidth >= browserWidth)
			x -= Math.max(optionList.offsetWidth, selection.offsetWidth)
				- Math.min(optionList.offsetWidth, selection.offsetWidth);

		if (y + optionList.offsetHeight + self.Frame.Root.offsetTop >= browserHeight)
			y -= selection.offsetHeight + optionList.offsetHeight - parseInt(DOM.GetStyle(selection, 'margin-bottom'));

		DOM.SetStyles(optionList, {
			left: `${x}px`,
			top: `${y}px`
		});
	};

	const SetOptionListInToolsMenuCoordinate = (editor: Editor, selection: HTMLElement, optionList: HTMLElement) => {
		const self = editor;

		const newStyles: Record<string, string> = {};

		const selectionRect = DOM.GetRect(selection);
		const rect = DOM.GetRect(optionList);
		if (!selectionRect || !rect) return;

		const group = selection.parentElement ?? selection;
		const addableTop = Str.Contains(DOM.GetAttr(group, 'class') ?? '', 'group') ? group.offsetTop : 0;
		const addableLeft = Str.Contains(DOM.GetAttr(group, 'class') ?? '', 'group') ? group.offsetLeft : 0;

		const helper = DOM.Select<HTMLElement>({
			class: DOM.Utils.CreateUEID('helper', false)
		}, selection);

		const helperLeft = helper?.offsetLeft ?? 0;
		const helperWidth = helper?.offsetWidth ?? 0;

		if (selectionRect.right + rect.width >= self.GetWin().innerWidth)
			newStyles.left = `${selectionRect.width - rect.width + helperLeft + helperWidth}px`;
		else
			newStyles.left = `${addableLeft + helperLeft}px`;

		if (selectionRect.bottom + rect.height + parseInt(DOM.GetStyle(self.DOM.Doc.body, 'margin-top', true)) >= self.GetWin().innerHeight)
			newStyles.top = `${addableTop + selection.offsetTop - optionList.offsetHeight}px`;
		else
			newStyles.top = `${addableTop + selection.offsetTop + selection.offsetHeight}px`;

		DOM.SetStyles(optionList, newStyles);
	};

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

	const RegisterCommand = (editor: Editor, name: string, command: (...args: never[]) => void) =>
		editor.Commander.Register(name, command);

	const RunCommand = <T>(editor: Editor, name: string, ...args: T[]) =>
		editor.Commander.Run(name, ...args);

	const RegisterKeyboardEvent = (editor: Editor, combinedKeys: string, callback: (event: Event) => void) => {
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

		if (keyCode) SetupWith(self, ENativeEvents.keydown, keyCode, keyOptions, (e: Editor, event: Event) => {
			PreventEvent(event);
			callback(event);
		});
	};

	const IsNearDisableList = (disableList: Set<string> | undefined, selector: HTMLElement, path: Node): boolean => {
		if (!disableList) {
			ToggleDisable(selector, false);
			return false;
		}
		const figure = DOM.Closest(path, { tagName: Arr.Convert(disableList) });
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
		CreateIconWrapSet,
		CreateInputWrap,
		ToggleActivateClass,
		HasActiveClass,
		ToggleDisable,
		IsDisabled,
		BindClickEvent,
		DestoryOpenedOptionList,
		CreateInputWrapWithOptionList,
		BindOptionListEvent,
		SetOptionListCoordinate,
		SetOptionListInToolsMenuCoordinate,
		UnwrapSameInlineFormats,
		RegisterCommand,
		RunCommand,
		RegisterKeyboardEvent,
		IsNearDisableList,
	};
};

export default FormatUI();