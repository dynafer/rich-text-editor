import Editor from '../../../packages/Editor';
import { IPluginListFormatUI } from '../Type';
import { IPluginListUI } from '../UI';

const NumberList = (editor: Editor, ui: IPluginListUI) => {
	const self = editor;
	const blockFormats = self.Formatter.Formats.BlockFormatTags;
	const listSelector = self.Formatter.Formats.ListItemSelector;

	const uiName = 'NumberList';
	const uiFormat: IPluginListFormatUI = {
		Format: { Tag: 'ol', Switchable: blockFormats.List, Following: listSelector, UnsetSwitcher: 'p' },
		Title: Finer.ILC.Get('plugins.lists.number') ?? 'Numbered List',
		Icon: 'OrderedList'
	};

	const button = ui.CreateIconButton(uiName, uiFormat);

	ui.RegisterDetector(button, uiFormat.Format);

	self.Toolbar.Add(uiName, button);
};

export default NumberList;