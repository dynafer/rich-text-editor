import { Arr } from '@dynafer/utils';
import Editor from '../../packages/Editor';
import { IFormatUI } from '../../packages/formatter/FormatUI';
import { IPluginsMediaFormatUI } from './utils/Type';

interface IPluginsIconWrapReturn {
	Wrapper: HTMLElement,
	Button: HTMLElement,
	Helper: HTMLElement,
}

interface IPluginsInputWrapCreateOption {
	uiName: string,
	placeholder: string,
	bUpdatable: boolean,
	createCallback: (input: HTMLInputElement) => void,
	src?: string,
}

interface IPluginsInputWrapReturn {
	OptionWrapper: HTMLElement,
	Input: HTMLInputElement,
}

export interface IPluginMediaUI {
	readonly ACTIVE_CLASS: string,
	readonly DISABLED_ATTRIBUTE: string,
	CreateFormatButton: (uiFormat: IPluginsMediaFormatUI) => IPluginsIconWrapReturn,
	CreateInputWrap: (opts: IPluginsInputWrapCreateOption) => IPluginsInputWrapReturn,
	RegisterCommand: IFormatUI['RegisterCommand'],
	RunCommand: IFormatUI['RunCommand'],
	BindClickEvent: (event: () => void, ...uiList: HTMLElement[]) => void,
}

const UI = (editor: Editor): IPluginMediaUI => {
	const self = editor;
	const DOM = self.GetRootDOM();
	const formatUI = self.Formatter.UI;

	const ACTIVE_CLASS = formatUI.ACTIVE_CLASS;
	const DISABLED_ATTRIBUTE = formatUI.DISABLED_ATTRIBUTE;

	const CreateFormatButton = (uiFormat: IPluginsMediaFormatUI): IPluginsIconWrapReturn => {
		const { Title, Icon } = uiFormat;

		const Wrapper = formatUI.CreateIconWrap(Title);
		const Button = formatUI.CreateIconButton(Title, Icon);
		const Helper = formatUI.CreateHelper(Title);

		DOM.Insert(Wrapper, Button, Helper);

		return {
			Wrapper,
			Button,
			Helper,
		};
	};

	const CreateInputWrap = (opts: IPluginsInputWrapCreateOption): IPluginsInputWrapReturn => {
		const { uiName, placeholder, bUpdatable, createCallback, src } = opts;
		const OptionWrapper = formatUI.CreateOptionList(uiName);
		DOM.SetAttr(OptionWrapper, 'media-url', 'true');
		DOM.On(OptionWrapper, Finer.NativeEventMap.click, event => Finer.PreventEvent(event));

		const { Wrapper, Input } = formatUI.CreateInputWrap(placeholder);
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

		const buttonGroup = formatUI.Create({
			tagName: 'div',
			type: 'button-group'
		});

		const cancelButton = formatUI.Create({
			tagName: 'button',
			title: 'Cancel',
			html: 'Cancel'
		});
		DOM.On(cancelButton, Finer.NativeEventMap.click, () => DOM.Doc.body.click());

		const insertButton = formatUI.Create({
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

	const RegisterCommand = formatUI.RegisterCommand;
	const RunCommand = formatUI.RunCommand;

	const BindClickEvent = (event: () => void, ...uiList: HTMLElement[]) =>
		Arr.Each(uiList, ui => formatUI.BindClickEvent(ui, event));

	return {
		ACTIVE_CLASS,
		DISABLED_ATTRIBUTE,
		CreateFormatButton,
		RegisterCommand,
		CreateInputWrap,
		RunCommand,
		BindClickEvent,
	};
};

export default UI;