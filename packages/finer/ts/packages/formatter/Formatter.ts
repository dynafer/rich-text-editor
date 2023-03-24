import Editor from '../Editor';
import * as Format from './Format';
import FormatDetector, { IFormatDetector } from './FormatDetector';
import FormatToggler, { IFormatToggler } from './FormatToggler';
import FormatUI, { IFormatUI } from './FormatUI';
import FormatUtils, { IFormatUtils } from './FormatUtils';
import FormatRegistry, { IFormatRegistry } from './ui/FormatRegistry';

export interface IFormatter {
	Formats: {
		TableSelector: string,
		TableRowSelector: string,
		TableCellSet: Set<string>,
		TableCellSelector: string,
		ListItemSelector: string,
		ListSet: Set<string>,
		ListSelector: string,
		BlockFormatTags: Record<string, Set<string>>,
	},
	UI: IFormatUI,
	Utils: IFormatUtils,
	Toggler: IFormatToggler,
	Detector: IFormatDetector,
	Registry: IFormatRegistry,
	Register: (name: string) => void,
}

const Formatter = (editor: Editor): IFormatter => {
	const self = editor;
	const Toggler = FormatToggler(self);
	const Detector = FormatDetector(self);
	const Registry = FormatRegistry(self, Detector);

	const Register = (name: string) => {
		const ui = Registry.Register(name);
		if (!ui) return;

		self.Toolbar.Add(name, ui);
	};

	return {
		Formats: {
			TableSelector: Format.TableSelector,
			TableRowSelector: Format.TableRowSelector,
			TableCellSet: Format.TableCellSet,
			TableCellSelector: Format.TableCellSelector,
			ListItemSelector: Format.ListItemSelector,
			ListSet: Format.ListSet,
			ListSelector: Format.ListSelector,
			BlockFormatTags: Format.BlockFormatTags,
		},
		UI: FormatUI,
		Utils: FormatUtils,
		Toggler,
		Detector,
		Registry,
		Register
	};
};

export default Formatter;