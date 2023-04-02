import { Type } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { ConvertURL } from '../Utils';
import AnchorUtils from './AnchorUtils';
import Unwrapper from './Unwrapper';
import Wrapper from './Wrapper';

const Toggler = (editor: Editor) => {
	const self = editor;

	const utils = AnchorUtils(self);

	const wrapper = Wrapper(self, utils);
	const unwrapper = Unwrapper(self, utils);

	const ToggleFromCaret = (bWrap: boolean, url?: string) => {
		if (!bWrap) return unwrapper.UnwrapFromCaret();

		if (!Type.IsString(url)) return;

		const convertedURL = ConvertURL(url);

		wrapper.WrapFromCaret(convertedURL);
	};

	return {
		ToggleFromCaret
	};
};

export default Toggler;