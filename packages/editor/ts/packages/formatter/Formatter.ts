import Editor from '../Editor';
import * as Format from './Format';
import FormatDetector, { IFormatDetector } from './FormatDetector';
import FormatToggler, { IFormatToggler } from './FormatToggler';
import FormatUI, { IFormatUI } from './FormatUI';
import FormatUtils, { IFormatUtils } from './FormatUtils';
import FormatRegistry, { IFormatRegistry } from './ui/FormatRegistry';

export interface IFormatter {
	readonly Formats: {
		readonly AllBlockFormats: Set<string>,
		readonly AllDisableList: Set<string>,
		readonly BlockFormatTags: Record<string, Set<string>>,
		readonly ListItemSelector: string,
		readonly ListSet: Set<string>,
		readonly ListSelector: string,
	},
	readonly UI: IFormatUI,
	readonly Utils: IFormatUtils,
	readonly Toggler: IFormatToggler,
	readonly Detector: IFormatDetector,
	readonly Registry: IFormatRegistry,
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
			AllBlockFormats: Format.AllBlockFormats,
			AllDisableList: Format.AllDisableList,
			BlockFormatTags: Format.BlockFormatTags,
			ListItemSelector: Format.ListItemSelector,
			ListSet: Format.ListSet,
			ListSelector: Format.ListSelector,
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