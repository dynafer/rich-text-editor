import Editor from '../Editor';
import { BlockFormatTags, FigureSelector, ListItemSelector, TableCellSelector, TableCellSet, TableRowSelector, TableSelector } from './Format';
import FormatDetector, { IFormatDetector } from './FormatDetector';
import FormatToggler, { IFormatToggler } from './FormatToggler';
import FormatUI, { IFormatUI } from './FormatUI';
import FormatUtils, { IFormatUtils } from './FormatUtils';
import FormatRegistry, { IFormatRegistry } from './ui/FormatRegistry';

export interface IFormatter {
	Formats: {
		FigureSelector: string,
		TableSelector: string,
		TableRowSelector: string,
		TableCellSet: Set<string>,
		TableCellSelector: string,
		ListItemSelector: string,
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
			FigureSelector,
			TableSelector,
			TableRowSelector,
			TableCellSet,
			TableCellSelector,
			ListItemSelector,
			BlockFormatTags,
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