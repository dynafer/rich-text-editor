import Editor from '../Editor';
import DOM from '../dom/DOM';
import FormatCaret from './FormatCaret';
import { ACTIVE_CLASS, IFormatOption } from './FormatType';

export interface IFormatUI {
	Activate: (togglerUI: HTMLElement, bActive: boolean) => void,
	Create: (option: IFormatOption, bAddEvent?: boolean, parent?: HTMLElement) => HTMLElement,
	CreateLabel: (value?: string) => HTMLElement,
	CreateOptionWrapper: () => HTMLElement,
	CreateSelection: (children?: Node[]) => HTMLElement,
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

	const Create = (option: IFormatOption, bAddEvent: boolean = true, parent: HTMLElement = self.Frame.Toolbar): HTMLElement => {
		const { ui, uiType, html } = option;
		const togglerUI = DOM.Create(ui.toLowerCase(), {
			class: DOM.Utils.CreateUEID(uiType.toLowerCase(), false),
			html: html
		});

		DOM.Insert(parent, togglerUI);

		if (bAddEvent) addUIEvent(togglerUI, option);

		return togglerUI;
	};

	const CreateLabel = (value: string = ''): HTMLElement =>
		DOM.Create('div', {
			class: DOM.Utils.CreateUEID('label', false),
			html: value
		});

	const CreateOptionWrapper = (): HTMLElement =>
		DOM.Create('div', {
			class: DOM.Utils.CreateUEID('options', false)
		});

	const CreateSelection = (children: Node[] = []): HTMLElement =>
		DOM.Create('div', {
			class: DOM.Utils.CreateUEID('select', false),
			children: children
		});

	return {
		Activate,
		Create,
		CreateLabel,
		CreateOptionWrapper,
		CreateSelection,
	};
};

export default FormatUI;