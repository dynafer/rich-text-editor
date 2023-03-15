import Editor from '../Editor';
import CaretUtils, { ICaretUtils } from './caret/CaretUtils';
import RangeUtils, { IRangeUtils } from './caret/RangeUtils';
import EventUtils, { IEventUtils } from './EventUtils';

export interface IEditorUtils {
	Caret: ICaretUtils,
	Range: (range?: Range) => IRangeUtils,
	Event: IEventUtils,
}

const EditorUtils = (editor: Editor): IEditorUtils => ({
	Caret: CaretUtils(editor),
	Range: (range: Range = new editor.DOM.Win.Range()): IRangeUtils => RangeUtils(range),
	Event: EventUtils(),
});

export default EditorUtils;