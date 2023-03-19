import { Arr } from '@dynafer/utils';
import Editor from '../../packages/Editor';
import { IPluginsMediaFormatUI } from './utils/Type';

interface IPluginsIconWrapReturn {
	Wrapper: HTMLElement,
	Button: HTMLElement,
	Helper: HTMLElement,
}

export interface IPluginImageUI {
	CreateButton: (uiFormat: IPluginsMediaFormatUI) => IPluginsIconWrapReturn,
	BindCliCkEvent: (event: () => void, ...uiList: HTMLElement[]) => void,
}

const UI = (editor: Editor): IPluginImageUI => {
	const self = editor;
	const DOM = self.GetRootDOM();
	const formatUI = self.Formatter.UI;

	const CreateButton = (uiFormat: IPluginsMediaFormatUI): IPluginsIconWrapReturn => {
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

	const BindCliCkEvent = (event: () => void, ...uiList: HTMLElement[]) =>
		Arr.Each(uiList, ui => formatUI.BindClickEvent(ui, event));

	return {
		CreateButton,
		BindCliCkEvent,
	};
};

export default UI;