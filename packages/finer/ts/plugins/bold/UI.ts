import Editor from '../../packages/Editor';
import DOM from '../../packages/dom/DOM';
import * as Icons from '../../packages/icons/Icons';
import { PLUGIN_NAME } from './Constants';

export const UI = (editor: Editor): HTMLElement | undefined => {
	const self = editor;
	if (!self.Config.Toolbars.includes(PLUGIN_NAME)) return;

	const button: HTMLElement = DOM.Create('button', {
		class: DOM.Utils.CreateUEID('icon', false),
		html: Icons.Bold
	});

	self.AddToolbar(button);

	return button;
};