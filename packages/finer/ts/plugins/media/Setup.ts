import { Arr, Type } from '@dynafer/utils';
import Editor from '../../packages/Editor';
import { TConfigurationMap } from '../../packages/EditorConfigure';
import Commands from './format/Commands';
import UI from './UI';
import ImageUploader from './ui/ImageUploader';
import MediaInserter from './ui/MediaInserter';
import MediaMenu from './ui/MediaMenu';
import URLMatcher from './utils/URLMatcher';

const Setup = (editor: Editor) => {
	const self = editor;
	const pluginManager = self.Plugin;
	const toolsManager = self.Tools.DOM.Manager;
	const formatUtils = self.Formatter.Utils;

	const ui = UI(self);

	const formatNames = ['Image', 'Media'];

	const parts = MediaMenu(self, ui);
	toolsManager.Attach({
		name: 'media',
		partAttachers: [parts.Create],
	});

	if (Type.IsArray(self.Config.MediaUrlPatterns)) {
		const matchers = self.Config.MediaUrlPatterns as TConfigurationMap<string, string>[];
		Arr.Each(matchers, matcher => URLMatcher.Add(matcher));
	}

	const createUi = <T = string>(name: T) => {
		if (!formatUtils.HasFormatName(name as string, formatNames)) return;
		const uiName = formatUtils.GetFormatName(name as string, formatNames);

		const commands = Commands(self);

		switch (uiName) {
			case formatNames[0]:
				commands.Register(formatNames[0]);
				ImageUploader(self, ui);
				break;
			case formatNames[1]:
				commands.Register(formatNames[1]);
				MediaInserter(self, ui);
				break;
		}
	};

	Arr.Each(formatNames, name => pluginManager.Add(name, createUi));
};

export default Setup;