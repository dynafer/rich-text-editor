import { Str, Type } from '@dynafer/utils';
import Editor from '../Editor';
import DOM from '../dom/DOM';
import { ENativeEvents, PreventEvent } from '../events/EventSetupUtils';
import { ACTIVE_CLASS, DISABLED_ATTRIBUTE, EFormatUI, IFormatOption, IFormatOptionBase, IFormatToggleTopNodeSettingBase } from './FormatType';
import FormatCaret from './FormatCaret';
import { FORMAT_BASES } from './FormatUtils';

export interface IFormatUI {
	GetSystemStyle: (style: string) => string,
	Create: (option: Pick<IFormatOption, 'Title' | 'UIName' | 'UIType' | 'Html'>, event?: (evt: Event) => void) => HTMLElement,
	CreateLabel: () => HTMLElement,
	CreateSelection: (ui: string, title: string, children?: (string | Node)[]) => HTMLElement,
	CreateOptionList: (type: string, children: Node[]) => HTMLElement,
	ToggleFormatCaret: (option: IFormatOptionBase, bActivated?: boolean) => void,
	UnwrapFormatCaret: (option: IFormatOptionBase) => void,
	CreateOption: (option: IFormatOption, active: boolean, setLabel: (text: string) => void) => HTMLElement,
	CreateOptionEvent: (name: string, clickable: HTMLElement, create: () => void) => void,
	SetOptionListCoordinate: (name: string, selection: HTMLElement, optionList: HTMLElement) => void,
	CreateDefaultUIClickEvent: (ui: HTMLElement, callback: (bActivated: boolean) => void, bAddClass?: boolean) => (() => void),
	ToggleDefaultButton: (ui: HTMLElement, bActive: boolean) => void,
	ToggleDefaultDisable: (ui: HTMLElement, bDisable: boolean) => void,
	ToggleTopNodeWithBoolean: (ui: HTMLElement, bToggle: boolean, option: IFormatOptionBase, topNodeSetting: IFormatToggleTopNodeSettingBase) => boolean,
}

const FormatUI = (editor: Editor): IFormatUI => {
	const self = editor;
	const caretToggler = FormatCaret(self);

	const GetSystemStyle = (style: string): string => self.DOM.GetStyle(self.GetBody(), style);

	const Create = (option: Pick<IFormatOption, 'Title' | 'UIName' | 'UIType' | 'Html'>, event?: (evt: Event) => void): HTMLElement => {
		const { Title, UIName, UIType, Html } = option;
		const formatUI = DOM.Create(Str.LowerCase(UIName), {
			attrs: {
				title: Title
			},
			class: DOM.Utils.CreateUEID(Str.LowerCase(UIType.replace(/_/gi, '-')), false),
			html: Html
		});

		if (event) DOM.On(formatUI, ENativeEvents.click, event);

		return formatUI;
	};

	const CreateLabel = (): HTMLElement =>
		DOM.Create(Str.LowerCase(EFormatUI.DIV), {
			class: DOM.Utils.CreateUEID('label', false)
		});

	const CreateSelection = (ui: string, title: string, children: (string | Node)[] = []): HTMLElement =>
		DOM.Create(Str.LowerCase(ui), {
			attrs: {
				title: title
			},
			class: DOM.Utils.CreateUEID('select', false),
			children: children
		});

	const CreateOptionList = (type: string, children: Node[] = []): HTMLElement =>
		DOM.Create(Str.LowerCase(EFormatUI.DIV), {
			attrs: {
				dataType: type
			},
			class: DOM.Utils.CreateUEID('options', false),
			children: children
		});

	const ToggleFormatCaret = (option: IFormatOptionBase, bActivated?: boolean) => {
		const { Format, FormatValue, SameOption, bTopNode } = option;
		if (!Type.IsBoolean(bActivated)) {
			caretToggler.Toggle(false, { Type: option.Type, Format, bTopNode });
			bActivated = true;
		}
		if (SameOption) {
			for (const same of SameOption) {
				caretToggler.Toggle(false, FORMAT_BASES[same]);
			}
		}
		caretToggler.Toggle(bActivated, { Type: option.Type, Format, FormatValue, bTopNode });
	};

	const UnwrapFormatCaret = (option: IFormatOptionBase) =>
		caretToggler.Toggle(false, { Type: option.Type, Format: option.Format, bTopNode: option.bTopNode });

	const CreateOption = (option: IFormatOption, active: boolean, setLabel: (text: string) => void): HTMLElement => {
		const { Format, FormatValue, SameOption, Title, bTopNode } = option;
		const optionElement = Create(option, () => {
			setLabel(active ? '' : Title);
			self.Focus();

			if (active) {
				UnwrapFormatCaret({ Type: option.Type, Format, bTopNode });
				return;
			}

			ToggleFormatCaret({ Type: option.Type, Format, FormatValue, SameOption, bTopNode });
		});

		if (active) DOM.AddClass(optionElement, ACTIVE_CLASS);

		return optionElement;
	};

	const CreateOptionEvent = (name: string, clickable: HTMLElement, create: () => void) => {
		const selectOptionList = (): Element | null => DOM.Select(`.${DOM.Utils.CreateUEID('options', false)}`, self.Frame.Root);
		const hasTypeAttribute = (): boolean => !!selectOptionList() && DOM.GetAttr(selectOptionList(), 'data-type') === name;
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

	const SetOptionListCoordinate = (name: string, selection: HTMLElement, optionList: HTMLElement) => {
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

	const ToggleDefaultButton = (ui: HTMLElement, bActive: boolean) => {
		const toggle = bActive ? DOM.AddClass : DOM.RemoveClass;
		toggle(ui, ACTIVE_CLASS);
	};

	const ToggleDefaultDisable = (ui: HTMLElement, bDisable: boolean) => {
		if (bDisable) {
			DOM.SetAttr(ui, DISABLED_ATTRIBUTE, DISABLED_ATTRIBUTE);
			return;
		}

		DOM.RemoveAttr(ui, DISABLED_ATTRIBUTE);
	};

	const CreateDefaultUIClickEvent = (ui: HTMLElement, callback: (bActivated: boolean) => void, bAddClass: boolean = true): (() => void) =>
		() => {
			const bActivated = !DOM.HasClass(ui, ACTIVE_CLASS);
			self.Focus();
			if (bAddClass) ToggleDefaultButton(ui, bActivated);
			callback(bActivated);
		};

	const ToggleTopNodeWithBoolean = (ui: HTMLElement, bToggle: boolean, option: IFormatOptionBase, topNodeSetting: IFormatToggleTopNodeSettingBase): boolean => {
		caretToggler.ToggleTopNode(bToggle, option, topNodeSetting);
		const { Format } = option;
		const { DefaultValue, bSubtract } = topNodeSetting;

		if (!DefaultValue) return true;

		const bZero = caretToggler.IsTopNodeZeroPixel(Format);
		if (bZero && bSubtract) ToggleDefaultDisable(ui, true);

		return bZero;
	};


	return {
		GetSystemStyle,
		Create,
		CreateLabel,
		CreateOptionList,
		CreateSelection,
		ToggleFormatCaret,
		UnwrapFormatCaret,
		CreateOption,
		CreateOptionEvent,
		SetOptionListCoordinate,
		ToggleDefaultButton,
		ToggleDefaultDisable,
		CreateDefaultUIClickEvent,
		ToggleTopNodeWithBoolean,
	};
};

export default FormatUI;