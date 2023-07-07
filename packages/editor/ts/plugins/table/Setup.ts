import { Arr } from '@dynafer/utils';
import Editor from '../../packages/Editor';
import RegisterCommands from './format/Commands';
import Table from './ui/Table';
import TableMenu from './ui/TableMenu';

const Setup = (editor: Editor) => {
	const self = editor;
	const pluginManager = self.Plugin;
	const partsManager = self.Tools.Parts.Manager;
	const formatUtils = self.Formatter.Utils;

	const formatNames = ['Table'];

	const parts = TableMenu(self);
	partsManager.Attach({
		name: 'table',
		partAttachers: [parts.Create],
	});

	const createUi = <T = string>(name: T) => {
		if (!formatUtils.HasFormatName(name as string, formatNames)) return;
		const uiName = formatUtils.GetFormatName(name as string, formatNames);
		switch (uiName) {
			case formatNames[0]:
				RegisterCommands(self);
				Table(self);
				break;
		}
	};

	Arr.Each(formatNames, name => pluginManager.Add(name, createUi));
};

export default Setup;