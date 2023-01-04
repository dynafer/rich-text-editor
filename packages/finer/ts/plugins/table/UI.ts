import Editor from '../../packages/Editor';
import { IPluginsTableFormatUI } from './Type';

interface IPluginsIconWrapReturn {
	Wrapper: HTMLElement,
	Button: HTMLElement,
	Helper: HTMLElement,
}

export interface IPluginTableUI {
	CreateIconWrap: (uiFormat: IPluginsTableFormatUI) => IPluginsIconWrapReturn,
	BindCliCkEvent: (event: () => void, ...uiList: HTMLElement[]) => void,
}

const UI = (editor: Editor): IPluginTableUI => {
	const self = editor;
	const DOM = self.GetRootDOM();
	const formatUI = self.Formatter.UI;

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

	const BindCliCkEvent = (event: () => void, ...uiList: HTMLElement[]) => {
		for (const ui of uiList) {
			formatUI.BindClickEvent(ui, event);
		}
	};

	return {
		CreateIconWrap,
		BindCliCkEvent,
	};
};

export default UI;