import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import Font from './Font';
import Buttons from './Buttons';

export interface IFormatRegistry {
	IsAailable: (name: string) => boolean,
	GetRegistry: (name: string) => ((name: string) => void) | null
}

const FormatRegistry = (editor: Editor): IFormatRegistry => {
	const self = editor;
	const font = Font(self);
	const tag = Buttons(self);

	const Available = Arr.MergeUnique(font.Formats, tag.Formats);

	const IsAailable = (name: string): boolean => Available.includes(name);

	const GetRegistry = (name: string): ((name: string) => void) | null => {
		switch (true) {
			case font.Formats.includes(name):
				return font.Register;
			case tag.Formats.includes(name):
				return tag.Register;
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