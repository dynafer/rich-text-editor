import { Str } from '@dynafer/utils';
import Editor from '../Editor';
import DOM from '../dom/DOM';
import { ENativeEvents } from '../events/EventSetupUtils';
import { ACTIVE_CLASS, IFormatOption } from './FormatType';
import FormatCaret from './FormatCaret';
import { FORMAT_BASES } from './FormatUtils';

export interface IFormatUI {
	GetSystemStyle: (style: string) => string,
	Create: (option: IFormatOption, bInsert: boolean, event: () => void) => HTMLElement,
	CreateLabel: () => HTMLElement,
	CreateSelection: (label: string, children?: (string | Node)[]) => HTMLElement,
	CreateOptionWrapper: (type: string, children: Node[]) => HTMLElement,
	CreateOption: (option: IFormatOption, active: boolean, setLabel: (text: string) => void) => HTMLElement,
	SelectOptionWrapper: () => Node | null,
	ExistsOptionWrapper: () => boolean,
	HasTypeAttribute: (type: string) => boolean,
	DestroyOptionWrapper: () => void,
}

const FormatUI = (editor: Editor): IFormatUI => {
	const self = editor;
	const caretToggler = FormatCaret(self);

	const GetSystemStyle = (style: string): string => self.DOM.GetStyle(self.GetBody(), style);

	const Create = (option: IFormatOption, bInsert: boolean, event: () => void): HTMLElement => {
		const { label, ui, uiType, html } = option;
		const togglerUI = DOM.Create(Str.LowerCase(ui), {
			attrs: {
				title: label
			},
			class: DOM.Utils.CreateUEID(Str.LowerCase(uiType.replace(/_/gi, '-')), false),
			html: html
		});

		DOM.On(togglerUI, ENativeEvents.click, event);

		if (bInsert) DOM.Insert(self.Frame.Toolbar, togglerUI);

		return togglerUI;
	};

	const CreateLabel = (): HTMLElement =>
		DOM.Create('div', {
			class: DOM.Utils.CreateUEID('label', false)
		});

	const CreateSelection = (label: string, children: (string | Node)[] = []): HTMLElement =>
		DOM.Create('div', {
			attrs: {
				title: label
			},
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
		const { type, format, formatValue, sameOption } = option;
		const optionElement = Create(option, false, () => {
			setLabel(option.label);
			self.Focus();
			caretToggler.Toggle(false, { type, format });
			if (sameOption) {
				for (const same of sameOption) {
					caretToggler.Toggle(false, FORMAT_BASES[same]);
				}
			}
			caretToggler.Toggle(true, { type, format, formatValue });
		});

		if (active) DOM.AddClass(optionElement, ACTIVE_CLASS);

		return optionElement;
	};

	const SelectOptionWrapper = (): Element | null => DOM.Select(`.${DOM.Utils.CreateUEID('options', false)}`, self.Frame.Root);
	const ExistsOptionWrapper = (): boolean => !!SelectOptionWrapper();
	const HasTypeAttribute = (type: string): boolean => DOM.GetAttr(SelectOptionWrapper(), 'data-type') === type;
	const DestroyOptionWrapper = () => DOM.Remove(SelectOptionWrapper(), true);

	return {
		GetSystemStyle,
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