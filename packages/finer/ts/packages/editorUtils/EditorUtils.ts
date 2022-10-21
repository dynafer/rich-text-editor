import Editor from 'finer/packages/Editor';
import CaretUtils, { ICaretUtils } from 'finer/packages/editorUtils/CaretUtils';
import EventUtils, { IEventUtils } from 'finer/packages/editorUtils/EventUtils';

export interface IEditorUtils {
	Caret: ICaretUtils,
	Event: IEventUtils
}

const EditorUtils = (editor: Editor): IEditorUtils => {
	const Caret = CaretUtils(editor);
	const Event = EventUtils();

	return {
		Caret,
		Event
	};
};

export default EditorUtils;