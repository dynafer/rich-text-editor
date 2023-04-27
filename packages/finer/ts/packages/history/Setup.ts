import { NodeType } from '@dynafer/dom-control';
import { Arr, Str } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { EInputEventType, ENativeEvents, PreventEvent } from '../events/EventSetupUtils';
import { EKeyCode } from '../events/keyboard/KeyboardUtils';
import HistoryManager, { IHistoryManager } from './HistoryManager';
import { MOVE_KEY_NAMES, REDO_COMMAND_NAME, UNDO_COMMAND_NAME } from './Utils';

const Setup = (editor: Editor): IHistoryManager => {
	const self = editor;
	const historyManager = HistoryManager(self);
	const archiver = historyManager.Archiver;

	self.On(ENativeEvents.keydown, event => {
		const bMoveCaret = MOVE_KEY_NAMES.has(event.code) || MOVE_KEY_NAMES.has(event.key);
		const bKeyZ = event.code === EKeyCode.KeyZ || event.key === EKeyCode.KeyZ;
		const bReversion = bKeyZ && event.ctrlKey;

		if (!bMoveCaret && !bReversion) return;

		if (bMoveCaret) {
			if (!historyManager.IsTexting()) return;
			archiver.History.Record();
			return historyManager.SetTexting(false);
		}

		if (historyManager.IsTexting()) return archiver.History.Archive();

		PreventEvent(event);
		const commandName = !event.shiftKey ? UNDO_COMMAND_NAME : REDO_COMMAND_NAME;
		self.Commander.Run(commandName);
	});

	const moveByHand = (event: MouseEvent | TouchEvent) => {
		if (!NodeType.IsNode(event.target) || DOM.Closest(event.target, { attrs: { dataFixed: 'parts-tool' } })) return;
		if (!historyManager.IsTexting()) return;
		archiver.History.Record();
		historyManager.SetTexting(false);
	};

	self.On(ENativeEvents.mousedown, moveByHand);
	self.On(ENativeEvents.touchstart, moveByHand);

	self.On(ENativeEvents.beforeinput, event => {
		const { inputType } = event;

		switch (inputType) {
			case EInputEventType.historyUndo:
			case EInputEventType.historyRedo:
				return historyManager.SetTexting(false);
			default:
				if (!Str.Contains(inputType, /(insert|delete)*.?(Text|Line|Backward||Forward)/gi)) return;

				if (!historyManager.IsTexting()) {
					archiver.Path.Record();
					archiver.Path.Archive();
				}

				return historyManager.SetTexting(true);
		}
	});

	self.On(ENativeEvents.input, (event: InputEvent) => {
		const { inputType } = event;

		switch (inputType) {
			case EInputEventType.historyUndo:
			case EInputEventType.historyRedo:
				archiver.Path.RecordArchive();
				archiver.History.RecordArchive();
				const commandName = inputType === EInputEventType.historyUndo ? UNDO_COMMAND_NAME : REDO_COMMAND_NAME;
				return self.Commander.Run(commandName);
			default:
				if (!Str.Contains(inputType, /(insert|delete)*.?(Text|Line|Backward||Forward)/gi)) return;

				return archiver.History.Archive();
		}
	});

	const createAdjustEvent = (name: string) =>
		() => {
			historyManager.SetTexting(false);
			if (Str.Contains(name, 'Start')) {
				archiver.Path.RecordArchive();
				archiver.History.RecordArchive();
				return archiver.Path.Archive();
			}

			archiver.Path.RecordArchive();
			archiver.History.Record();
		};

	const adjustEvents = ['Tools:Adjust:Start', 'Tools:Adjust:Finish', 'Tools:Move:Start', 'Tools:Move:Finish'];
	Arr.Each(adjustEvents, eventName => self.On(eventName, createAdjustEvent(eventName)));

	self.On('Tools:Move:Cancel', () => archiver.Path.Unarchive());

	self.On('Command:Before', (name: string) => {
		if (name === UNDO_COMMAND_NAME || name === REDO_COMMAND_NAME) return;
		if (self.History.IsTexting()) {
			archiver.Path.RecordArchive();
			archiver.History.RecordArchive();
		}
		archiver.Path.Record();
	});

	self.On('Command:After', (name: string) => {
		if (name === UNDO_COMMAND_NAME || name === REDO_COMMAND_NAME) return;
		archiver.History.Record();
		if (!self.History.IsTexting()) return;

		self.History.SetTexting(false);
		archiver.Path.Archive();
		archiver.History.Archive();
	});

	self.Commander.Register(UNDO_COMMAND_NAME, () => {
		if (historyManager.IsTexting()) {
			self.Focus();
			archiver.Path.RecordArchive();
			archiver.History.Record();
		}
		historyManager.SetTexting(false);
		historyManager.Undo();
		self.Focus();
	});

	self.Commander.Register(REDO_COMMAND_NAME, () => {
		historyManager.SetTexting(false);
		historyManager.Redo();
		self.Focus();
	});

	return historyManager;
};

export default Setup;