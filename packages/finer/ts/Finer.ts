import '../../scss/Finer.scss';
import { Editor, IEditor } from 'finer/packages/Editor';

declare global {
	const finer: IEditor;
}

const finer: IEditor = Editor;

export default finer;