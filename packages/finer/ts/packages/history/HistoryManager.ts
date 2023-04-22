import { Arr, Utils } from '@dynafer/utils';
import Editor from '../Editor';
import HistoryArchiver, { IHistoryArchiver } from './Archiver';
import { IHistoryRecord, THistoryPath } from './Types';
import { GetHTMLHistory, Revert } from './Utils';

export interface IHistoryManager {
	readonly Archiver: IHistoryArchiver,
	readonly Histories: IHistoryRecord[],
	SetTexting: (bTextingState: boolean) => void,
	IsTexting: () => boolean,
	CanUndo: () => boolean,
	CanRedo: () => boolean,
	Flag: () => string,
	Unflag: () => void,
	Record: (history: IHistoryRecord) => void,
	AddUndoPath: (path: THistoryPath) => void,
	Clean: () => void,
	Undo: () => void,
	Redo: () => void,
	CreateData: () => string,
	ChangeData: (flag: string, data: string) => void,
}

const HistoryManager = (editor: Editor): IHistoryManager => {
	const self = editor;
	const Histories: IHistoryRecord[] = [];
	const flags: Record<string, number> = {};
	const archiver = HistoryArchiver(self);

	let bTexting = false;
	let currentIndex = -1;
	let flagId: string | null = null;

	const SetTexting = (bTextingState: boolean) => { bTexting = bTextingState; };
	const IsTexting = (): boolean => bTexting;

	const CanUndo = (): boolean => currentIndex > 0;
	const CanRedo = (): boolean => currentIndex < Histories.length - 1;

	const Flag = (): string => {
		flagId = Utils.CreateUUID();
		return flagId;
	};

	const Unflag = () => {
		if (!flagId) return;
		delete flags?.[flagId];
		flagId = null;
	};

	const Record = (history: IHistoryRecord) => {
		++currentIndex;
		Histories.splice(currentIndex, Histories.length, history);
		if (!flagId) return;
		flags[flagId] = currentIndex;
	};

	const AddUndoPath = (path: THistoryPath) => {
		if (!Histories[currentIndex]) return;
		Histories[currentIndex].undo = path;
	};

	const Clean = () => {
		Arr.Clean(Histories);
		currentIndex = -1;
	};

	const Undo = () => {
		if (!CanUndo()) return;
		--currentIndex;
		const history = Histories[currentIndex];
		if (history.undo) Revert(self, history.data, history.undo);
		self.Utils.Shared.DispatchCaretChange();
	};

	const Redo = () => {
		if (!CanRedo()) return;
		++currentIndex;
		const history = Histories[currentIndex];
		Revert(self, history.data, history.redo);
		self.Utils.Shared.DispatchCaretChange();
	};

	const CreateData = (): string => GetHTMLHistory(self);

	const ChangeData = (flag: string, data: string) => {
		if (!flags[flag] || !Histories[flags[flag]]) return;
		Histories[flags[flag]].data = data;
	};

	return {
		Archiver: archiver,
		Histories,
		SetTexting,
		IsTexting,
		CanUndo,
		CanRedo,
		Flag,
		Unflag,
		Record,
		AddUndoPath,
		Clean,
		Undo,
		Redo,
		CreateData,
		ChangeData,
	};
};

export default HistoryManager;