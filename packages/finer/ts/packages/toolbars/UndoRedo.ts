import Editor from '../Editor';
import { ENativeEvents } from '../events/EventSetupUtils';
import FormatUI from '../formatter/FormatUI';
import { REDO_COMMAND_NAME, UNDO_COMMAND_NAME } from '../history/Utils';

const UndoRedo = (editor: Editor) => {
	const self = editor;

	const formats = [
		{ Name: UNDO_COMMAND_NAME, Title: self.Lang('toolbar.undo', 'Undo'), CommandName: UNDO_COMMAND_NAME, Keys: 'Ctrl+Z' },
		{ Name: REDO_COMMAND_NAME, Title: self.Lang('toolbar.redo', 'Redo'), CommandName: REDO_COMMAND_NAME, Keys: 'Ctrl+Shift+Z' },
	];

	const Create = (index: number) => {
		const { Name, Title, CommandName, Keys } = formats[index];

		return (): HTMLElement => {
			const Detector = self.Formatter.Detector;
			const historyManager = self.History;

			const button = FormatUI.CreateIconButton(Title, Name);

			self.AddShortcut(Title, Keys);

			FormatUI.BindClickEvent(button, () => {
				self.Commander.Run(CommandName);
			});

			const checkDisable = () => {
				const canDo = CommandName === UNDO_COMMAND_NAME ? historyManager.CanUndo : historyManager.CanRedo;
				FormatUI.ToggleDisable(button, !canDo());
			};

			Detector.Register(checkDisable);

			checkDisable();

			if (CommandName === UNDO_COMMAND_NAME)
				self.On(ENativeEvents.keyup, () => {
					const bHasHistory = historyManager.CanUndo() || historyManager.IsTexting();
					FormatUI.ToggleDisable(button, !bHasHistory);
				});

			self.On('Command:After', (name: string) => {
				if (name === UNDO_COMMAND_NAME || name === REDO_COMMAND_NAME) return;
				const canDo = CommandName === UNDO_COMMAND_NAME ? historyManager.CanUndo : historyManager.CanRedo;
				FormatUI.ToggleDisable(button, !canDo());
			});

			return button;
		};
	};

	return {
		Undo: {
			Name: formats[0].Name,
			Create: Create(0),
		},
		Redo: {
			Name: formats[1].Name,
			Create: Create(1),
		}
	};
};

export default UndoRedo;