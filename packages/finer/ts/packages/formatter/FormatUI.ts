import { Str } from '@dynafer/utils';
import Editor from '../Editor';
import DOM from '../dom/DOM';
import { ENativeEvents } from '../events/EventSetupUtils';
import { ACTIVE_CLASS, EFormatUI, IFormatOption } from './FormatType';
import FormatCaret from './FormatCaret';
import { FORMAT_BASES } from './FormatUtils';

export interface IFormatUI {
	GetSystemStyle: (style: string) => string,
	Create: (option: Pick<IFormatOption, 'Title' | 'UIName' | 'UIType' | 'Html'>, event: () => void) => HTMLElement,
	CreateLabel: () => HTMLElement,
	CreateSelection: (ui: string, title: string, children?: (string | Node)[]) => HTMLElement,
	CreateOptionList: (type: string, children: Node[]) => HTMLElement,
	CreateOption: (option: IFormatOption, active: boolean, setLabel: (text: string) => void) => HTMLElement,
	SelectOptionList: () => Node | null,
	ExistsOptionList: () => boolean,
	HasTypeAttribute: (type: string) => boolean,
	DestroyOptionList: () => void,
	SetOptionListCoordinate: (name: string, selection: HTMLElement, optionList: HTMLElement) => void,
}

const FormatUI = (editor: Editor): IFormatUI => {
	const self = editor;
	const caretToggler = FormatCaret(self);

	const GetSystemStyle = (style: string): string => self.DOM.GetStyle(self.GetBody(), style);

	const Create = (option: Pick<IFormatOption, 'Title' | 'UIName' | 'UIType' | 'Html'>, event: () => void): HTMLElement => {
		const { Title, UIName, UIType, Html } = option;
		const formatUI = DOM.Create(Str.LowerCase(UIName), {
			attrs: {
				title: Title
			},
			class: DOM.Utils.CreateUEID(Str.LowerCase(UIType.replace(/_/gi, '-')), false),
			html: Html
		});

		DOM.On(formatUI, ENativeEvents.click, event);

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

	const CreateOption = (option: IFormatOption, active: boolean, setLabel: (text: string) => void): HTMLElement => {
		const { Type, Format, FormatValue, SameOption, Title } = option;
		const optionElement = Create(option, () => {
			setLabel(Title);
			self.Focus();
			caretToggler.Toggle(false, { Type, Format });
			if (SameOption) {
				for (const same of SameOption) {
					caretToggler.Toggle(false, FORMAT_BASES[same]);
				}
			}
			caretToggler.Toggle(true, { Type, Format, FormatValue });
		});

		if (active) DOM.AddClass(optionElement, ACTIVE_CLASS);

		return optionElement;
	};

	const SelectOptionList = (): Element | null => DOM.Select(`.${DOM.Utils.CreateUEID('options', false)}`, self.Frame.Root);
	const ExistsOptionList = (): boolean => !!SelectOptionList();
	const HasTypeAttribute = (type: string): boolean => DOM.GetAttr(SelectOptionList(), 'data-type') === type;
	const DestroyOptionList = () => DOM.Remove(SelectOptionList(), true);

	const SetOptionListCoordinate = (name: string, selection: HTMLElement, optionList: HTMLElement) => {
		const bInGroup = self.Toolbar.IsInGroup(name);
		const browserWidth = DOM.Win.innerWidth + DOM.Win.scrollX;
		const browserHeight = DOM.Win.innerHeight + DOM.Win.scrollY;
		let x = selection.offsetLeft - self.Frame.Toolbar.scrollLeft
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

	return {
		GetSystemStyle,
		Create,
		CreateLabel,
		CreateOptionList,
		CreateSelection,
		SelectOptionList,
		CreateOption,
		ExistsOptionList,
		HasTypeAttribute,
		DestroyOptionList,
		SetOptionListCoordinate,
	};
};

export default FormatUI;