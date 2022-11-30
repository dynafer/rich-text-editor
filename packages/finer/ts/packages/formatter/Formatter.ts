import { Type } from '@dynafer/utils';
import Editor from '../Editor';
import FormatRegistry, { IFormatRegistry } from './format/FormatRegistry';

export interface IFormatter {
	Formats: IFormatRegistry,
	Register: (name: string) => void,
}

const Formatter = (editor: Editor): IFormatter => {
	const self = editor;
	const Formats = FormatRegistry(self);

	const Register = (name: string) => {
		if (!Formats.IsAailable(name)) return;

		const registry = Formats.GetRegistry(name);
		if (!Type.IsFunction(registry)) return;

		const ui = registry(name);
		if (!ui) return;

		self.Toolbar.Add(name, ui);
	};

	return {
		Formats,
		Register
	};
};

export {
	Formatter
};