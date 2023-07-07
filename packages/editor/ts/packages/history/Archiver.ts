import DOM from '../dom/DOM';
import Editor from '../Editor';
import { IHistoryRecord, THistoryPath } from './Types';
import { CreateHistoryPath, GetHTMLHistory } from './Utils';

interface IHistoryArchiverPart {
	Archive: () => void,
	Unarchive: () => void,
	RecordArchive: () => void,
	Record: () => void,
}

export interface IHistoryArchiver {
	readonly History: IHistoryArchiverPart,
	readonly Path: IHistoryArchiverPart,
}

const HistoryArchiver = (editor: Editor): IHistoryArchiver => {
	const self = editor;

	const createPath = (): THistoryPath | null => CreateHistoryPath(self, self.Utils.Caret.Get() ?? DOM.Element.Table.GetSelectedCells(self));

	const createHistory = (): IHistoryRecord | null => {
		const path = createPath();
		return !path ? null : {
			data: GetHTMLHistory(self),
			redo: path,
		};
	};

	const make = <T>(archive: () => T | null, record: (data: T) => void): IHistoryArchiverPart => {
		let saved: T | null;

		const Archive = () => { saved = archive(); };
		const Unarchive = () => { saved = null; };

		const RecordArchive = () => {
			if (!saved) return;
			record(saved);
			saved = null;
		};

		const Record = () => {
			Archive();
			RecordArchive();
		};

		return {
			Archive,
			Unarchive,
			RecordArchive,
			Record,
		};
	};

	const History = make<IHistoryRecord>(createHistory, data => {
		const historyManager = self.History;
		historyManager.Record(data);
	});

	const Path = make<THistoryPath>(createPath, data => {
		const historyManager = self.History;
		historyManager.AddUndoPath(data);
	});

	return {
		History,
		Path,
	};
};

export default HistoryArchiver;