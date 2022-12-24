import Editor from '../../packages/Editor';
import Toggler from './format/Toggler';
import { IPluginListFormat, IPluginListFormatUI } from './Type';

export interface IPluginListUI {
	IsDetected: (tagName: string, nodes: Node[]) => boolean,
	CreateIconButton: (uiName: string, uiFormat: IPluginListFormatUI) => HTMLElement,
	RegisterDetector: (button: HTMLElement, format: IPluginListFormat) => void,
}

const UI = (editor: Editor): IPluginListUI => {
	const self = editor;
	const formatUI = self.Formatter.UI;
	const formatUtils = self.Formatter.Utils;
	const Detector = self.Formatter.Detector;

	const IsDetected = (tagName: string, nodes: Node[]): boolean => {
		for (const node of nodes) {
			if (!self.DOM.Closest(node as Element, tagName)) continue;

			return true;
		}
		return false;
	};

	const createCommand = (format: IPluginListFormat, button: HTMLElement) =>
		<T = boolean>(bActive: T) => {
			const toggler = Toggler(self, format);
			toggler.ToggleFromCaret(bActive as boolean);
			formatUI.ToggleActivateClass(button, bActive as boolean);

			self.Dispatch('caret:change', []);
		};

	const CreateIconButton = (uiName: string, uiFormat: IPluginListFormatUI): HTMLElement => {
		const { Format, Title, Icon } = uiFormat;
		const button = formatUI.CreateIconButton(Title, Icon);
		const command = createCommand(Format, button);
		formatUI.RegisterCommand(self, uiName, command);

		formatUI.BindClickEvent(button, () => formatUI.RunCommand(self, uiName, !formatUI.HasActiveClass(button)));

		return button;
	};

	const RegisterDetector = (button: HTMLElement, format: IPluginListFormat) => {
		Detector.Register((paths: Node[]) => {
			const node = formatUtils.GetParentIfText(paths[0]);
			formatUI.ToggleActivateClass(button, IsDetected(format.Tag, [node]));
		});
	};

	return {
		IsDetected,
		CreateIconButton,
		RegisterDetector,
	};
};

export default UI;