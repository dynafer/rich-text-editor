import { Str } from '@dynafer/utils';
import { IPluginTableCommand } from './Type';

const createCommandName = (name: string): string => Str.Join(':', 'Table', name);
const createStyleCommandName = (name: string): string => Str.Join(':', 'TableStyle', name);
const createRowCommandName = (name: string): string => createCommandName(Str.Join(':', 'Row', name));
const createColumnCommandName = (name: string): string => createCommandName(Str.Join(':', 'Column', name));

export const COMMAND_NAMES_MAP = {
	TABLE_CREATE: createCommandName('Create'),
	TABLE_REMOVE: createCommandName('Remove'),
	FLOAT_LEFT: createStyleCommandName('FloatLeft'),
	FLOAT_RIGHT: createStyleCommandName('FloatRight'),
	ALIGN_LEFT: createStyleCommandName('AlignLeft'),
	ALIGN_CENTER: createStyleCommandName('AlignCenter'),
	ALIGN_RIGHT: createStyleCommandName('AlignRight'),
	ROW: {
		INSERT: createRowCommandName('Insert'),
		SELECT: createRowCommandName('Select'),
		DELETE: createRowCommandName('Delete'),
	},
	COLUMN: {
		INSERT: createColumnCommandName('Insert'),
		SELECT: createColumnCommandName('Select'),
		DELETE: createColumnCommandName('Delete'),
	}
};

export const STYLE_COMMANDS: IPluginTableCommand[] = [
	{ Name: COMMAND_NAMES_MAP.FLOAT_LEFT, Styles: { float: 'left' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
	{ Name: COMMAND_NAMES_MAP.FLOAT_RIGHT, Styles: { float: 'right' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
	{ Name: COMMAND_NAMES_MAP.ALIGN_LEFT, Styles: { marginLeft: '0px', marginRight: 'auto' }, SameStyles: ['float'] },
	{ Name: COMMAND_NAMES_MAP.ALIGN_CENTER, Styles: { marginLeft: 'auto', marginRight: 'auto' }, SameStyles: ['float'] },
	{ Name: COMMAND_NAMES_MAP.ALIGN_RIGHT, Styles: { marginLeft: 'auto', marginRight: '0px' }, SameStyles: ['float'] },
];

export const GetMenuText = (name: string, defaultText: string): string => Finer.ILC.Get(Str.Merge('plugins.tools.menu.', name), defaultText);