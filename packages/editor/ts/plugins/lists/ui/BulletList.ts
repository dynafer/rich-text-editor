import Editor from '../../../packages/Editor';
import { IPluginListFormatUI } from '../Type';
import { IPluginListUI } from '../UI';

const BulletList = (editor: Editor, ui: IPluginListUI) => {
	const self = editor;
	const blockFormats = self.Formatter.Formats.BlockFormatTags;
	const listSelector = self.Formatter.Formats.ListItemSelector;

	const uiName = 'BulletList';
	const uiFormat: IPluginListFormatUI = {
		Format: { Tag: 'ul', Switchable: blockFormats.List, Following: listSelector, UnsetSwitcher: 'p' },
		Title: self.Lang('plugins.lists.bullet', 'Bulleted List'),
		Icon: 'UnorderedList'
	};

	const button = ui.CreateIconButton(uiName, uiFormat);

	ui.RegisterDetector(button, uiFormat.Format);

	self.Toolbar.Add(uiName, button);
};

export default BulletList;