import Editor from '../Editor';
import FormatToggler, { IFormatToggler } from './FormatToggler';
import FormatRegistry, { IFormatRegistry } from './ui/FormatRegistry';

export interface IFormatter {
	Toggler: IFormatToggler,
	Registry: IFormatRegistry,
	Register: (name: string) => void,
}

const Formatter = (editor: Editor): IFormatter => {
	const self = editor;
	const Toggler = FormatToggler(self);
	const Registry = FormatRegistry(self);

	const Register = (name: string) => {
		const ui = Registry.Register(name);
		if (!ui) return;

		self.Toolbar.Add(name, ui);
	};

	return {
		Toggler,
		Registry,
		Register
	};
};

export default Formatter;