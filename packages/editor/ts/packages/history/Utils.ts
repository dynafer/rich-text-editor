import { Arr, Type } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { EKeyCode } from '../events/keyboard/KeyboardUtils';
import { TCreateHistoryData, THistoryPath } from './Types';

const getPath = (node: Node | null, until: Node) => {
	const path: number[] = [];

	let current: Node | null = node;
	while (current && current !== until) {
		if (!current.parentElement) break;
		Arr.Unshift(path, Arr.Find(DOM.GetChildNodes(current.parentElement), current));
		current = current.parentElement;
	}

	return path;
};

const findPath = (body: Node, paths: number[]): Node => {
	let target = body;
	Arr.Each(paths, (path, exit) => {
		if (!DOM.GetChildNodes(target)[path]) exit();
		target = DOM.GetChildNodes(target)[path];
	});
	return target;
};

export const UNDO_COMMAND_NAME = 'Undo';
export const REDO_COMMAND_NAME = 'Redo';

export const MOVE_KEY_NAMES = new Set<string>([
	EKeyCode.ArrowUp,
	EKeyCode.ArrowDown,
	EKeyCode.ArrowLeft,
	EKeyCode.ArrowRight,
	EKeyCode.Home,
	EKeyCode.End,
	EKeyCode.PageDown,
	EKeyCode.PageUp,
	EKeyCode.Enter
]);

export const GetHTMLHistory = (editor: Editor): string => {
	const self = editor;
	const fake = DOM.Create('div');
	DOM.CloneAndInsert(fake, true, ...self.GetLines());
	Arr.WhileShift(self.Tools.Parts.Manager.SelectParts(true, fake), parts => DOM.Remove(parts));
	const html = DOM.GetHTML(fake);
	DOM.Remove(fake);
	return html;
};

export const CreateHistoryPath = (editor: Editor, data: TCreateHistoryData): THistoryPath | null => {
	const self = editor;

	if (Type.IsArray(data)) {
		const table = DOM.Element.Table.FindClosest(data[0] ?? null);
		if (Arr.IsEmpty(data) || !table) return null;

		const path: number[] = getPath(table, self.GetBody());
		const indexes: number[] = [];

		const ownCells = DOM.Element.Table.GetAllOwnCells(table);
		Arr.Each(data, cell => Arr.Push(indexes, Arr.Find(ownCells, cell)));

		return {
			type: 'cells',
			info: {
				path,
				indexes
			}
		};
	}

	if (!data.IsRange()) return {
		type: 'caret',
		info: {
			path: getPath(data.Start.Node, self.GetBody()),
			offset: data.Start.Offset
		}
	};

	if (data.Start.Node === data.End.Node) return {
		type: 'node',
		info: {
			path: getPath(data.Start.Node, self.GetBody()),
			start: data.Start.Offset,
			end: data.End.Offset,
		}
	};

	return {
		type: 'range',
		info: {
			start: {
				path: getPath(data.Start.Node, self.GetBody()),
				offset: data.Start.Offset
			},
			end: {
				path: getPath(data.End.Node, self.GetBody()),
				offset: data.End.Offset
			}
		}
	};
};

export const Revert = (editor: Editor, data: string, history: Exclude<THistoryPath, 'data'>) => {
	const self = editor;
	const CaretUtils = self.Utils.Caret;

	const { type, info } = history;

	Arr.WhileShift(self.Tools.Parts.Manager.SelectParts(true), parts => DOM.Remove(parts, true));
	self.SetContent(data);

	const newRange = self.Utils.Range();

	switch (type) {
		case 'cells':
			const table = findPath(self.GetBody(), info.path);
			const ownCells = DOM.Element.Table.GetAllOwnCells(table);
			Arr.Each(info.indexes, index => DOM.Element.Table.ToggleSelectCell(true, ownCells[index]));
			CaretUtils.CleanRanges();
			break;
		case 'caret':
			newRange.SetStartToEnd(findPath(self.GetBody(), info.path), info.offset, info.offset);
			break;
		case 'node':
			newRange.SetStartToEnd(findPath(self.GetBody(), info.path), info.start, info.end);
			break;
		case 'range':
			newRange.SetStart(findPath(self.GetBody(), info.start.path), info.start.offset);
			newRange.SetEnd(findPath(self.GetBody(), info.end.path), info.end.offset);
			break;
	}

	if (type !== 'cells') CaretUtils.UpdateRange(newRange);
	self.Utils.Shared.DispatchCaretChange();
	self.Tools.Parts.ChangePositions();
};