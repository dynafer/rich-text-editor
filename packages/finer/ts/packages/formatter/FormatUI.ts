import Editor from '../Editor';
import DOM from '../dom/DOM';
import { ENativeEvents } from '../events/EventSetupUtils';
import * as Icons from '../icons/Icons';
import FormatCaret from './FormatCaret';
import { ACTIVE_CLASS, ATTRIBUTE_DATA_VALUE, IFormatOption } from './FormatType';

export interface IFormatUI {
	Activate: (togglerUI: HTMLElement, bActive: boolean) => void,
	Create: (option: IFormatOption, bAddEvent?: boolean, bInsert?: boolean) => HTMLElement,
	CreateLabel: () => HTMLElement,
	CreateSelection: (children?: (string | Node)[]) => HTMLElement,
	CreateOptionWrapper: (type: string, children: Node[]) => HTMLElement,
	CreateOption: (option: IFormatOption, active: boolean, setLabel: (text: string) => void)=> HTMLElement,
	SelectOptionWrapper: () => Node | null,
	ExistsOptionWrapper: () => boolean,
	HasTypeAttribute: (type: string) => boolean,
	DestroyOptionWrapper: () => void,
}

const FormatUI = (editor: Editor): IFormatUI => {
	const self = editor;
	const caretToggler = FormatCaret(self);

	const Activate = (togglerUI: HTMLElement, bActive: boolean) => {
		const toggle = bActive ? DOM.AddClass : DOM.RemoveClass;
		toggle(togglerUI, ACTIVE_CLASS);
	};

	const addUIEvent = (togglerUI: HTMLElement, option: IFormatOption) => {
		const { type, format, formatValue, uiEvent } = option;
		DOM.On(togglerUI, uiEvent, () => {
			const bActivated = !DOM.HasClass(togglerUI, ACTIVE_CLASS);
			self.Focus();
			Activate(togglerUI, bActivated);
			caretToggler.Toggle(bActivated, { type, format, formatValue });
		});
	};

	const Create = (option: IFormatOption, bAddEvent: boolean = true, bInsert: boolean = true): HTMLElement => {
		const { ui, uiType, html } = option;
		const togglerUI = DOM.Create(ui.toLowerCase(), {
			class: DOM.Utils.CreateUEID(uiType.toLowerCase(), false),
			html: html
		});

		if (bInsert) DOM.Insert(self.Frame.Toolbar, togglerUI);
		if (bAddEvent) addUIEvent(togglerUI, option);

		return togglerUI;
	};

	const CreateLabel = (): HTMLElement =>
		DOM.Create('div', {
			class: DOM.Utils.CreateUEID('label', false)
		});

	const CreateSelection = (children: (string | Node)[] = []): HTMLElement =>
		DOM.Create('div', {
			class: DOM.Utils.CreateUEID('select', false),
			children: children
		});

	const CreateOptionWrapper = (type: string, children: Node[] = []): HTMLElement =>
		DOM.Create('div', {
			attrs: {
				dataType: type
			},
			class: DOM.Utils.CreateUEID('options', false),
			children: children
		});

	const CreateOption = (option: IFormatOption, active: boolean, setLabel: (text: string) => void): HTMLElement => {
		const { type, format, formatValue } = option;
		const optionElement = Create(option, false, false);
		DOM.SetHTML(optionElement, `${Icons.Check}${DOM.GetHTML(optionElement)}`);
		DOM.SetAttr(optionElement, ATTRIBUTE_DATA_VALUE, option.html);
		if (active) DOM.AddClass(optionElement, ACTIVE_CLASS);

		DOM.On(optionElement, ENativeEvents.click, () => {
			setLabel(option.html);
			self.Focus();
			caretToggler.Toggle(false, { type, format });
			caretToggler.Toggle(true, { type, format, formatValue });
		});

		return optionElement;
	};

	const SelectOptionWrapper = (): Element | null => DOM.Select(`.${DOM.Utils.CreateUEID('options', false)}`, self.Frame.Root);
	const ExistsOptionWrapper = (): boolean => !!SelectOptionWrapper();
	const HasTypeAttribute = (type: string): boolean => DOM.GetAttr(SelectOptionWrapper(), 'data-type') === type;
	const DestroyOptionWrapper = () => DOM.Remove(SelectOptionWrapper(), true);

	return {
		Activate,
		Create,
		CreateLabel,
		CreateOptionWrapper,
		CreateSelection,
		SelectOptionWrapper,
		CreateOption,
		ExistsOptionWrapper,
		HasTypeAttribute,
		DestroyOptionWrapper,
	};
};

export default FormatUI;