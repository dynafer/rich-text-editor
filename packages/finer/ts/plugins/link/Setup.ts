import { Arr } from '@dynafer/utils';
import Editor from '../../packages/Editor';
import Link from './ui/Link';

const Setup = (editor: Editor) => {
	const self = editor;
	const pluginManager = self.Plugin;
	const formatUtils = self.Formatter.Utils;

	const formatNames = ['Link'];

	const createUi = <T = string>(name: T) => {
		if (!formatUtils.HasFormatName(name as string, formatNames)) return;
		const uiName = formatUtils.GetFormatName(name as string, formatNames);

		switch (uiName) {
			case formatNames[0]:
				Link(self);
				break;
		}
	};

	Arr.Each(formatNames, name => pluginManager.Add(name, createUi));
};

export default Setup;