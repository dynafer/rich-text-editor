import { Str } from '@dynafer/utils';

const createCommandName = (name: string): string => Str.Join(':', 'Table', name);
const createStyleCommandName = (name: string): string => Str.Join(':', 'TableStyle', name);

export const COMMAND_NAMES_MAP = {
	TABLE_CREATE: createCommandName('Create'),
	TABLE_REMOVE: createCommandName('Remove'),
	FLOAT_LEFT: createStyleCommandName('FloatLeft'),
	FLOAT_RIGHT: createStyleCommandName('FloatRight'),
	ALIGN_LEFT: createStyleCommandName('AlignLeft'),
	ALIGN_CENTER: createStyleCommandName('AlignCenter'),
	ALIGN_RIGHT: createStyleCommandName('AlignRight'),
};