import { Arr, Str } from '@dynafer/utils';
import Editor from '../Editor';
import { ICaretData } from '../editorUtils/CaretUtils';
import { IEvent } from '../editorUtils/EventUtils';

export interface IPluginManager {
	DetectByTagName: (tagName: string, activate: (bActive: boolean) => void) => void,
	DetectByStyle: (styleName: string, activate: (bActive: boolean) => void) => void,
}

const PluginManager = (editor: Editor) => {
	editor.On('caret:change', ((carets: ICaretData[]) => {
		const caretPointers = editor.DOM.SelectAll('[caret]');
		const currentCarets = [];
		for (const caret of carets) {
			if ((caret.Start.Path[1] ?? false) && editor.DOM.HasAttr(caret.Start.Path[1], 'caret')) currentCarets.push(caret.Start.Path[1]);
			if ((caret.End.Path[1] ?? false) && editor.DOM.HasAttr(caret.End.Path[1], 'caret')) currentCarets.push(caret.End.Path[1]);
		}

		for (const caretPointer of caretPointers) {
			if (currentCarets.includes(caretPointer)) continue;

			if (Str.IsEmpty(editor.DOM.GetInnerText(caretPointer))) {
				caretPointer.remove();
			} else {
				caretPointer.replaceWith(caretPointer.children[0]);
			}
		}
	}) as IEvent);

	const DetectByTagName = (tagName: string, activate: (bActive: boolean) => void) => {
		editor.On('caret:change', ((carets: ICaretData[]) => {
			let mergedPath: Node[] = [];

			for (const caret of carets) {
				mergedPath = Arr.UniqueMerge(mergedPath, caret.Start.Path, caret.End.Path);
			}

			for (const path of mergedPath) {
				if (editor.DOM.GetTagName(path) === tagName) {
					activate(true);
					return;
				}
			}

			activate(false);
		}) as IEvent);
	};

	const DetectByStyle = (styleName: string, activate: (bActive: boolean) => void) => {
		editor.On('caret:change', ((carets: ICaretData[]) => {
			let mergedPath: Node[] = [];

			for (const caret of carets) {
				mergedPath = Arr.UniqueMerge(mergedPath, caret.Start.Path, caret.End.Path);
			}

			for (const path of mergedPath) {
				if (editor.DOM.HasStyle(path as HTMLElement, styleName)) {
					activate(true);
					return;
				}
			}

			activate(false);
		}) as IEvent);
	};

	return {
		DetectByTagName,
		DetectByStyle
	};
};

export default PluginManager;