import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import FormatDetector from '../FormatDetector';
import { IFormatRegistryJoiner } from '../FormatType';
import FormatUI from '../FormatUI';
import Color from './Color';
import Default from './Default';
import Font from './Font';
import Group from './Group';

export interface IFormatRegistry {
	IsAailable: (name: string) => boolean,
	GetRegistry: (name: string) => IFormatRegistryJoiner['Register'] | null,
}

const FormatRegistry = (editor: Editor): IFormatRegistry => {
	const self = editor;
	const detector = FormatDetector(self);
	const UI = FormatUI(self);

	const color = Color(self, UI);
	const defaultFormats = Default(detector, UI);
	const font = Font(self, detector, UI);
	const group = Group(self, detector, UI);

	const Available = Arr.MergeUnique(
		color.Formats,
		defaultFormats.Formats,
		font.Formats,
		group.Formats,
	);

	const IsAailable = (name: string): boolean => Arr.Contains(Available, name);

	const GetRegistry = (name: string): IFormatRegistryJoiner['Register'] | null => {
		switch (true) {
			case Arr.Contains(color.Formats, name):
				return color.Register;
			case Arr.Contains(defaultFormats.Formats, name):
				return defaultFormats.Register;
			case Arr.Contains(font.Formats, name):
				return font.Register;
			case Arr.Contains(group.Formats, name):
				return group.Register;
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