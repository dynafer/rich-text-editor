import { Arr } from '@dynafer/utils';
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
		const toggle = bWrap ? wrapper.WrapFromCaret : unwrapper.UnwrapFromCaret;

		Arr.Each(CaretUtils.Get(), caret => formatUtils.RunFormatting(self, () => toggle(caret)));

		CaretUtils.Clean();
	};

	return {
		ToggleFromCaret
	};
};

export default Toggler;