import { ICaretData } from '../editorUtils/caret/CaretUtils';

interface IHistory {
	data: string,
}

interface IHistoryCaret {
	readonly path: number[],
	readonly offset: number,
}

interface IHistoryCaretPath {
	type: 'caret',
	info: IHistoryCaret,
}

interface IHistoryNodePath {
	type: 'node',
	info: {
		path: number[],
		start: number,
		end: number,
	},
}

interface IHistoryRangePath {
	type: 'range',
	info: {
		start: IHistoryCaret,
		end: IHistoryCaret,
	},
}

interface IHistorySelectedCells {
	type: 'cells',
	info: {
		path: number[],
		indexes: number[],
	},
}

export type THistoryPath = IHistoryCaretPath | IHistoryNodePath | IHistoryRangePath | IHistorySelectedCells;

export type TCreateHistoryData = ICaretData | Element[];

export interface IHistoryRecord extends IHistory {
	undo?: THistoryPath,
	redo: THistoryPath,
}