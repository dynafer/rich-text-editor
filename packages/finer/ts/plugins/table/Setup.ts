import { Arr } from '@dynafer/utils';
import Editor from '../../packages/Editor';
import UI from './UI';
import Table from './ui/Table';
import TableMenu from './ui/TableMenu';

const Setup = (editor: Editor) => {
	const self = editor;
	const pluginManager = self.Plugin;
	const toolsManager = self.Tools.DOM.Manager;
	const formatUtils = self.Formatter.Utils;

	const ui = UI(self);

	const formatNames = ['Table'];

	const parts = TableMenu(self, ui);
	toolsManager.Attach({
		name: 'table',
		partAttachers: [parts.Create],
	});

	const createUi = <T = string>(name: T) => {
		if (!formatUtils.HasFormatName(name as string, formatNames)) return;
		const uiName = formatUtils.GetFormatName(name as string, formatNames);
		switch (uiName) {
			case formatNames[0]:
				Table(self, ui);
				break;
		}
	};

	Arr.Each(formatNames, name => pluginManager.Add(name, createUi));
};

export default Setup;