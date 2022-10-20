import DOM from 'finer/packages/dom/DOM';
import Editor from 'finer/packages/Editor';
import { PLUGIN_NAME } from 'finer/plugins/bold/Constants';
import * as Icons from 'finer/packages/icons/Icons';

export const UI = (editor: Editor) => {
	if (!editor.Config.Toolbars.includes(PLUGIN_NAME)) return;

	const button: HTMLButtonElement = DOM.Create('button', {
		class: DOM.Utils.CreateUEID('icon', false),
		html: Icons.Bold
	});

	DOM.On(button, 'click', () => {
		if (DOM.HasClass(button, 'active')) {
			DOM.RemoveClass(button, 'active');
		} else {
			DOM.AddClass(button, 'active');
		}
	});

	editor.AddToolbar(button);
};