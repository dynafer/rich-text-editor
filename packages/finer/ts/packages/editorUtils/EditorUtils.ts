import Editor from '../Editor';
import CaretUtils, { ICaretUtils } from './caret/CaretUtils';
import RangeUtils, { IRangeUtils } from './caret/RangeUtils';
import EventUtils, { IEventUtils } from './EventUtils';
import SharedUtils, { ISharedUtils } from './SharedUtils';

export interface IEditorUtils {
	readonly Caret: ICaretUtils,
	Range: (range?: Range) => IRangeUtils,
	readonly Event: IEventUtils,
	readonly Shared: ISharedUtils,
}

const EditorUtils = (editor: Editor): IEditorUtils => ({
	Caret: CaretUtils(editor),
	Range: (range?: Range): IRangeUtils => {
		const win = editor.GetWin();
		return RangeUtils(range ?? new win.Range());
	},
	Event: EventUtils(editor),
	Shared: SharedUtils(editor),
});

export default EditorUtils;