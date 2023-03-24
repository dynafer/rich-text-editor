import { Arr } from '@dynafer/utils';
import Editor from '../../packages/Editor';
import ImageMenuEvents from './events/ImageMenuEvents';
import UI from './UI';
import ImageMenu from './ui/ImageMenu';
import ImageUploader from './ui/ImageUploader';

const Setup = (editor: Editor) => {
	const self = editor;
	const pluginManager = self.Plugin;
	const toolsManager = self.Tools.DOM.Manager;
	const formatUtils = self.Formatter.Utils;

	const ui = UI(self);

	const formatNames = ['Image'];

	const createUi = <T = string>(name: T) => {
		if (!formatUtils.HasFormatName(name as string, formatNames)) return;
		const uiName = formatUtils.GetFormatName(name as string, formatNames);
		switch (uiName) {
			case 'Image':
				ImageUploader(self, ui).Create();
				const parts = ImageMenu(self, ui);
				toolsManager.Attach({
					name: 'img',
					partAttachers: [parts.Create],
					partPositionListeners: [parts.ChangePosition]
				});
				ImageMenuEvents(self).Register();
				break;
		}
	};

	Arr.Each(formatNames, name => pluginManager.Add(name, createUi));
};

export default Setup;