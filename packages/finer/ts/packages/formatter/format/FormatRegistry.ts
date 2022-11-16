import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import Color from './Color';
import Default from './Default';
import Font from './Font';

export interface IFormatRegistry {
	IsAailable: (name: string) => boolean,
	GetRegistry: (name: string) => ((name: string) => void) | null
}

const FormatRegistry = (editor: Editor): IFormatRegistry => {
	const self = editor;
	const color = Color(self);
	const defaultFormats = Default(self);
	const font = Font(self);

	const Available = Arr.MergeUnique(
		color.Formats,
		defaultFormats.Formats,
		font.Formats,
	);

	const IsAailable = (name: string): boolean => Available.includes(name);

	const GetRegistry = (name: string): ((name: string) => void) | null => {
		switch (true) {
			case color.Formats.includes(name):
				return color.Register;
			case defaultFormats.Formats.includes(name):
				return defaultFormats.Register;
			case font.Formats.includes(name):
				return font.Register;
			default:
				return null;
		}
	};

	return {
		IsAailable,
		GetRegistry,
	};
};

export default FormatRegistry;