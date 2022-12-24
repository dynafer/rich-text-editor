import Editor from '../../../packages/Editor';
import { IPluginListUI } from '../UI';

const NumberList = (editor: Editor, ui: IPluginListUI) => {
	const self = editor;
	const blockFormats = self.Formatter.BlockFormats;

	const uiName = 'NumberList';
	const uiFormat = {
		Format: { Tag: 'ol', Switchable: blockFormats.List, Following: 'li', UnsetSwitcher: 'p' },
		Title: 'Numbered List',
		Icon: 'OrderedList'
	};

	const button = ui.CreateIconButton(uiName, uiFormat);

	ui.RegisterDetector(button, uiFormat.Format);

	self.Toolbar.Add('NumberList', button);
};

export default NumberList;