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
	const formats = self.Formatter.Formats;
	const formatUI = self.Formatter.UI;
	const Detector = self.Formatter.Detector;

	const IsDetected = (tagName: string, nodes: Node[]): boolean => {
		for (let index = 0, length = nodes.length; index < length; ++index) {
			const node = nodes[index];
			if (!self.DOM.Closest(node, tagName)) continue;

			return true;
		}
		return false;
	};

	const createCommand = (format: IPluginListFormat, button: HTMLElement) =>
		<T = boolean>(bActive: T) => {
			const toggler = Toggler(self, format);
			toggler.ToggleFromCaret(bActive as boolean);
			formatUI.ToggleActivateClass(button, bActive as boolean);

			self.Utils.Shared.DispatchCaretChange();
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
			formatUI.ToggleActivateClass(button, IsDetected(format.Tag, paths));

			const figure = self.DOM.Element.Figure.GetClosest(paths[0]);
			const bDisable = !!figure && formats.BlockFormatTags.Figures.has(self.DOM.GetAttr(figure, 'type') ?? '');
			formatUI.ToggleDisable(button, bDisable);
		});
	};

	return {
		IsDetected,
		CreateIconButton,
		RegisterDetector,
	};
};

export default UI;