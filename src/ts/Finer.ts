import '../scss/Finer.scss';
import { Editor, IEditor } from 'finer/packages/Editor';

declare global {
	interface IMap<T = string> {
		[key: string]: T
	}

	const finer: IEditor;
}

const finer: IEditor = Editor;

export default finer;