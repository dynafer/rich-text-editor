import { Arr, Obj } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import TableFormat from '../format/Table';
import { IPluginTableCommand } from '../Type';
import { COMMAND_NAMES_MAP, STYLE_COMMANDS } from '../Utils';
import TableColumn from './TableColumn';
import TableRow from './TableRow';
import TableStyles from './TableStyles';

const RegisterCommands = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const createCommand = (row: number, cell: number) => {
		const tableFormat = TableFormat(self);
		tableFormat.CreateFromCaret(row, cell);
	};

	const createRemoveCommand = (node: Node) => DOM.Element.Figure.Remove(self, node);

	const createStyleCommand = (format: IPluginTableCommand) =>
		(bActive: boolean, node: Node) => {
			const { FigureElement } = DOM.Element.Figure.Find<HTMLElement>(node);
			if (!FigureElement) return null;

			const toggler = TableStyles(self, format);
			toggler.Toggle(bActive, FigureElement);
		};

	const createRowColumnCommand = (type: 'row' | 'column', key: string) => {
		const formatterCreator = type === 'row' ? TableRow : TableColumn;
		const formatter = formatterCreator(self);

		return (bAboveOrLeft: boolean) => {
			switch (key) {
				case 'INSERT':
					return formatter.InsertFromCaret(bAboveOrLeft);
				case 'SELECT':
					return formatter.SelectFromCaret();
				case 'DELETE':
					return formatter.DeleteFromCaret();
			}
		};
	};

	self.Commander.Register(COMMAND_NAMES_MAP.TABLE_CREATE, createCommand);
	self.Commander.Register(COMMAND_NAMES_MAP.TABLE_REMOVE, createRemoveCommand);
	Arr.Each(STYLE_COMMANDS, command => self.Commander.Register(command.Name, createStyleCommand(command)));

	Obj.Entries(COMMAND_NAMES_MAP.ROW, (key, name) => self.Commander.Register(name, createRowColumnCommand('row', key)));
	Obj.Entries(COMMAND_NAMES_MAP.COLUMN, (key, name) => self.Commander.Register(name, createRowColumnCommand('column', key)));
};

export default RegisterCommands;