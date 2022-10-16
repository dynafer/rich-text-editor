import { Utils } from 'dynafer/utils';
import Editor from 'finer/packages/Editor';
import { PLUGIN_NAME } from 'finer/plugins/bold/Constants';
import Icon from './Icon.svg';

export const UI = (editor: Editor) => {
	if (!editor.toolbars.includes(PLUGIN_NAME)) return;

	const button: HTMLButtonElement = editor.dom.Create('button', {
		class: Utils.CreateUEID('icon', false),
		html: Icon
	});

	editor.dom.Insert(editor.frame.toolbar, button);
};