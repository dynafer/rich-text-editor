import { Arr } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import TableFormat from '../format/Table';
import { IPluginTableCommand } from '../Type';
import { COMMAND_NAMES_MAP } from '../Utils';
import TableStyles from './TableStyles';

const RegisterCommands = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const styleCommands: IPluginTableCommand[] = [
		{ Name: COMMAND_NAMES_MAP.FLOAT_LEFT, Styles: { float: 'left' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
		{ Name: COMMAND_NAMES_MAP.FLOAT_RIGHT, Styles: { float: 'right' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
		{ Name: COMMAND_NAMES_MAP.ALIGN_LEFT, Styles: { marginLeft: '0px', marginRight: 'auto' }, SameStyles: ['float'] },
		{ Name: COMMAND_NAMES_MAP.ALIGN_CENTER, Styles: { marginLeft: 'auto', marginRight: 'auto' }, SameStyles: ['float'] },
		{ Name: COMMAND_NAMES_MAP.ALIGN_RIGHT, Styles: { marginLeft: 'auto', marginRight: '0px' }, SameStyles: ['float'] },
	];

	const createStyleCommand = (format: IPluginTableCommand) =>
		(bActive: boolean, node: Node) => {
			const { FigureElement } = DOM.Element.Figure.Find<HTMLElement>(node);
			if (!FigureElement) return null;

			const toggler = TableStyles(self, format);
			toggler.Toggle(bActive, FigureElement);
		};

	const createCommand = (row: number, cell: number) => {
		const tableFormat = TableFormat(self);
		tableFormat.CreateFromCaret(row, cell);
	};

	const createRemoveCommand = (node: Node) => DOM.Element.Figure.Remove(self, node);

	self.Commander.Register(COMMAND_NAMES_MAP.TABLE_CREATE, createCommand);
	self.Commander.Register(COMMAND_NAMES_MAP.TABLE_REMOVE, createRemoveCommand);
	Arr.Each(styleCommands, command => self.Commander.Register(command.Name, createStyleCommand(command)));
};

export default RegisterCommands;