import { Arr } from '@dynafer/utils';
import Editor from '../../packages/Editor';
import { ICaretData } from '../../packages/editorUtils/CaretUtils';
import { IEvent } from '../../packages/editorUtils/EventUtils';
import { ACTIVE } from './Constants';

const Setup = (editor: Editor, ui: HTMLElement) => {
	let bActive = false;

	const setActive = () => {
		bActive = true;
		editor.GetRootDOM().AddClass(ui, ACTIVE);
	};

	const unsetActive = () => {
		bActive = false;
		editor.GetRootDOM().RemoveClass(ui, ACTIVE);
	};

	const applyPlugin = () => {
		if (bActive) {
			unsetActive();
		} else {
			setActive();
		}

		// fix me here...
	};

	editor.GetRootDOM().On(ui, 'click', () => {
		applyPlugin();
		editor.Focus();
	});

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

export default Setup;