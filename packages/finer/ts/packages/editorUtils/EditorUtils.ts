import Editor from '../Editor';
import CaretUtils, { ICaretUtils } from './CaretUtils';
import EventUtils, { IEventUtils } from './EventUtils';

export interface IEditorUtils {
	Caret: ICaretUtils,
	Event: IEventUtils,
}

const EditorUtils = (editor: Editor): IEditorUtils => {
	const Caret = CaretUtils(editor);
	const Event = EventUtils();

	return {
		Caret,
		Event,
	};
};

export default EditorUtils;