import Editor from '../../../packages/Editor';
import { IPluginListFormat } from '../Type';
import Unwrapper from './Unwrapper';
import Wrapper from './Wrapper';

const Toggler = (editor: Editor, format: IPluginListFormat) => {
	const self = editor;
	const CaretUtils = self.Utils.Caret;
	const formatUtils = self.Formatter.Utils;

	const wrapper = Wrapper(self, format);
	const unwrapper = Unwrapper(self, format);

	const ToggleFromCaret = (bWrap: boolean) => {
		self.Focus();

		const toggle = bWrap ? wrapper.WrapFromCaret : unwrapper.UnwrapFromCaret;

		for (const caret of CaretUtils.Get()) {
			formatUtils.RunFormatting(self, () => toggle(caret));
		}

		CaretUtils.Clean();
		self.Focus();
	};

	return {
		ToggleFromCaret
	};
};

export default Toggler;