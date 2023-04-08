import { Arr } from '@dynafer/utils';
import Editor from '../../packages/Editor';
import { IPluginsTableFormatUI } from './Type';

interface IPluginsIconWrapReturn {
	readonly Wrapper: HTMLElement,
	readonly Button: HTMLElement,
	readonly Helper: HTMLElement,
}

export interface IPluginTableUI {
	readonly ACTIVE_CLASS: string,
	readonly DISABLED_ATTRIBUTE: string,
	CreateIconWrap: (uiFormat: IPluginsTableFormatUI) => IPluginsIconWrapReturn,
	BindClickEvent: (event: () => void, ...uiList: HTMLElement[]) => void,
}

const UI = (editor: Editor): IPluginTableUI => {
	const self = editor;
	const DOM = self.GetRootDOM();
	const formatUI = self.Formatter.UI;

	const ACTIVE_CLASS = formatUI.ACTIVE_CLASS;
	const DISABLED_ATTRIBUTE = formatUI.DISABLED_ATTRIBUTE;

	const CreateIconWrap = (uiFormat: IPluginsTableFormatUI): IPluginsIconWrapReturn => {
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

	const BindClickEvent = (event: () => void, ...uiList: HTMLElement[]) =>
		Arr.Each(uiList, ui => formatUI.BindClickEvent(ui, event));

	return {
		ACTIVE_CLASS,
		DISABLED_ATTRIBUTE,
		CreateIconWrap,
		BindClickEvent,
	};
};

export default UI;