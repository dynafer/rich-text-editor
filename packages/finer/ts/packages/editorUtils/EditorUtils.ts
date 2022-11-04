import Editor from '../Editor';
import EventUtils, { IEventUtils } from './EventUtils';
import CaretUtils, { ICaretUtils } from './caret/CaretUtils';

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