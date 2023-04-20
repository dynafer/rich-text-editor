import { Arr } from '@dynafer/utils';
import Editor from '../../packages/Editor';
import { IFormatUI } from '../../packages/formatter/FormatUI';
import { IPluginsMediaFormatUI } from './utils/Type';

interface IPluginsIconWrapReturn {
	readonly Wrapper: HTMLElement,
	readonly Button: HTMLElement,
	readonly Helper: HTMLElement,
}

export interface IPluginMediaUI {
	readonly ACTIVE_CLASS: string,
	readonly DISABLED_ATTRIBUTE: string,
	CreateFormatButton: (uiFormat: IPluginsMediaFormatUI) => IPluginsIconWrapReturn,
	RegisterCommand: IFormatUI['RegisterCommand'],
	RunCommand: IFormatUI['RunCommand'],
	BindClickEvent: (event: () => void, ...uiList: HTMLElement[]) => void,
}

const UI = (editor: Editor): IPluginMediaUI => {
	const self = editor;
	const DOM = self.DOM;
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

	const RegisterCommand = formatUI.RegisterCommand;
	const RunCommand = formatUI.RunCommand;

	const BindClickEvent = (event: () => void, ...uiList: HTMLElement[]) =>
		Arr.Each(uiList, ui => formatUI.BindClickEvent(ui, event));

	return {
		ACTIVE_CLASS,
		DISABLED_ATTRIBUTE,
		CreateFormatButton,
		RegisterCommand,
		RunCommand,
		BindClickEvent,
	};
};

export default UI;