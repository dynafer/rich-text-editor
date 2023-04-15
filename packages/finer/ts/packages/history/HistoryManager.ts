import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import HistoryArchiver, { IHistoryArchiver } from './Archiver';
import { IHistoryRecord, THistoryPath } from './Types';
import { Revert } from './Utils';

export interface IHistoryManager {
	readonly Archiver: IHistoryArchiver,
	readonly Histories: IHistoryRecord[],
	SetTexting: (bTextingState: boolean) => void,
	IsTexting: () => boolean,
	CanUndo: () => boolean,
	CanRedo: () => boolean,
	Record: (history: IHistoryRecord) => void,
	AddUndoPath: (path: THistoryPath) => void,
	Clean: () => void,
	Undo: () => void,
	Redo: () => void,
}

const HistoryManager = (editor: Editor): IHistoryManager => {
	const self = editor;
	const histories: IHistoryRecord[] = [];
	const archiver = HistoryArchiver(self);

	let bTexting = false;
	let currentIndex = -1;

	const SetTexting = (bTextingState: boolean) => { bTexting = bTextingState; };
	const IsTexting = (): boolean => bTexting;

	const CanUndo = (): boolean => currentIndex > 0;
	const CanRedo = (): boolean => currentIndex < histories.length - 1;

	const Record = (history: IHistoryRecord) => {
		++currentIndex;
		histories.splice(currentIndex, histories.length, history);
	};

	const AddUndoPath = (path: THistoryPath) => {
		if (!histories[currentIndex]) return;
		histories[currentIndex].undo = path;
	};

	const Clean = () => {
		Arr.Clean(histories);
		currentIndex = -1;
	};

	const Undo = () => {
		if (!CanUndo()) return;
		--currentIndex;
		const history = histories[currentIndex];
		if (history.undo) Revert(self, history.data, history.undo);
	};

	const Redo = () => {
		if (!CanRedo()) return;
		++currentIndex;
		const history = histories[currentIndex];
		Revert(self, history.data, history.redo);
	};

	return {
		Archiver: archiver,
		Histories: histories,
		SetTexting,
		IsTexting,
		CanUndo,
		CanRedo,
		Record,
		AddUndoPath,
		Clean,
		Undo,
		Redo,
	};
};

export default HistoryManager;