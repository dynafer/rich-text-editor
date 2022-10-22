import { Arr } from 'dynafer/utils';
import Editor from 'finer/packages/Editor';
import DOM from 'finer/packages/dom/DOM';
import { ICaretData } from 'finer/packages/editorUtils/CaretUtils';
import { IEvent } from 'finer/packages/editorUtils/EventUtils';
import * as Icons from 'finer/packages/icons/Icons';
import { ACTIVE, PLUGIN_NAME } from 'finer/plugins/bold/Constants';

export const UI = (editor: Editor) => {
	if (!editor.Config.Toolbars.includes(PLUGIN_NAME)) return;

	const button: HTMLButtonElement = DOM.Create('button', {
		class: DOM.Utils.CreateUEID('icon', false),
		html: Icons.Bold
	});

	let bActive = false;

	const setActive = () => {
		bActive = true;
		DOM.AddClass(button, ACTIVE);
	};

	const unsetActive = () => {
		bActive = false;
		DOM.RemoveClass(button, ACTIVE);
	};

	const applyPlugin = () => {
		if (bActive) {
			unsetActive();
		} else {
			setActive();
		}

		// fix me here...
	};

	DOM.On(button, 'click', () => {
		applyPlugin();
	});

	editor.AddToolbar(button);

	const caretChangeEvent = ((carets: ICaretData[]) => {
		let mergedPath: Node[] = [];

		bActive = false;

		for (const caret of carets) {
			mergedPath = Arr.UniqueMerge(mergedPath, caret.Start.Path, caret.End.Path);
		}

		for (const path of mergedPath) {
			if (editor.DOM.GetTagName(path) === 'strong') {
				setActive();
				break;
			}
		}

		if (!bActive) unsetActive();
	}) as IEvent;

	editor.On('caret:change', caretChangeEvent);
};