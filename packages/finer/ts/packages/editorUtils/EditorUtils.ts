import Editor from 'finer/packages/Editor';
import CaretUtils from 'finer/packages/editorUtils/CaretUtils';
import EventUtils, { IEventUtils } from 'finer/packages/editorUtils/EventUtils';

export interface IEditorUtils {
	Caret: CaretUtils,
	Event: IEventUtils
}

const EditorUtils = (editor: Editor): IEditorUtils => {
	const Caret = new CaretUtils(editor);
	const Event = EventUtils;

	return {
		Caret,
		Event
	};
};

export default EditorUtils;