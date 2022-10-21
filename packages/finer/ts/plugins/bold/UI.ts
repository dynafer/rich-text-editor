import DOM from 'finer/packages/dom/DOM';
import Editor from 'finer/packages/Editor';
import { PLUGIN_NAME } from 'finer/plugins/bold/Constants';
import * as Icons from 'finer/packages/icons/Icons';
import { ICaretData } from 'finer/packages/editorUtils/CaretUtils';
import { TEvent } from 'finer/packages/editorUtils/EventUtils';

export const UI = (editor: Editor) => {
	if (!editor.Config.Toolbars.includes(PLUGIN_NAME)) return;

	const button: HTMLButtonElement = DOM.Create('button', {
		class: DOM.Utils.CreateUEID('icon', false),
		html: Icons.Bold
	});

	const toggleTag = () => {
		if (DOM.HasClass(button, 'active')) {
			DOM.RemoveClass(button, 'active');
		} else {
			DOM.AddClass(button, 'active');
		}

		// fix me here...
	};

	DOM.On(button, 'click', () => {
		toggleTag();
	});

	editor.AddToolbar(button);

	const caretChangeEvent: TEvent = ((type: string, position: ICaretData) => {
		if (!['key', 'mouse', 'touch'].includes(type)) return;

		for (const path of position.Start.Path) {
			if (editor.DOM.GetTagName(path) === 'strong') {
				DOM.AddClass(button, 'active');
				break;
			}
		}

		for (const path of position.End.Path) {
			if (editor.DOM.GetTagName(path) === 'strong') {
				DOM.AddClass(button, 'active');
				break;
			}
		}
	}) as TEvent;

	editor.Utils.Event.On('caret:change', caretChangeEvent);
};