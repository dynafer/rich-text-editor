import Editor from '../Editor';
import DOM from '../dom/DOM';
import FormatCaret from './FormatCaret';
import { IFormat } from './FormatType';

export interface IFormatUI {
	Activate: (togglerUI: HTMLElement, bActivation: boolean) => void,
	Create: (format: IFormat) => HTMLElement,
}

const FormatUI = (editor: Editor): IFormatUI => {
	const self = editor;
	const caretToggler = FormatCaret(self);

	const Activate = (togglerUI: HTMLElement, bActivation: boolean) => {
		if (bActivation) {
			DOM.AddClass(togglerUI, 'active');
		} else {
			DOM.RemoveClass(togglerUI, 'active');
		}
	};

	const addUIEvent = (togglerUI: HTMLElement, format: IFormat) => {
		DOM.On(togglerUI, format.uiEvent, () => {
			const bActivated = !DOM.HasClass(togglerUI, 'active');
			self.Focus();
			Activate(togglerUI, bActivated);
			caretToggler.Toggle(bActivated, { type: format.type, format: format.format, formatValue: format.formatValue });
		});
	};

	const Create = (format: IFormat): HTMLElement => {
		const togglerUI = DOM.Create(format.ui, {
			class: DOM.Utils.CreateUEID(format.uiType, false),
			html: format.html
		});

		DOM.Insert(self.Frame.Toolbar, togglerUI);

		addUIEvent(togglerUI, format);

		return togglerUI;
	};

	return {
		Activate,
		Create,
	};
};

export default FormatUI;