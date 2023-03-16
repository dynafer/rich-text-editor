import { Arr } from '@dynafer/utils';
import Editor from '../../packages/Editor';
import UI from './UI';
import BulletList from './ui/BulletList';
import NumberList from './ui/NumberList';

const Setup = (editor: Editor) => {
	const self = editor;
	const pluginManager = self.Plugin;
	const formatUtils = self.Formatter.Utils;

	const ui = UI(self);

	const formatNames = ['BulletList', 'NumberList'];

	const createUi = <T = string>(name: T) => {
		if (!formatUtils.HasFormatName(name as string, formatNames)) return;
		const uiName = formatUtils.GetFormatName(name as string, formatNames);
		switch (uiName) {
			case 'BulletList':
				BulletList(self, ui);
				break;
			case 'NumberList':
				NumberList(self, ui);
				break;
		}
	};

	Arr.Each(formatNames, name => pluginManager.Add(name, createUi));
};

export default Setup;