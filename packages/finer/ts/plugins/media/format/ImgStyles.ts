import Editor from 'finer/packages/Editor';
import { IPluginImageMenuFormatUI } from '../utils/Type';

const ImgStyles = (editor: Editor, format: IPluginImageMenuFormatUI) => {
	const self = editor;
	const DOM = self.DOM;
	const { Styles, SameStyles, bAsText } = format;

	const wrapStyle = () => {
		// TODO: Wrap image styles
	};

	const unwrapStyle = () => {
		// TODO: Unwrap image styles
	};

	const Toggle = (bWrap: boolean) => {
		const toggle = bWrap ? wrapStyle : unwrapStyle;
		toggle();
	};

	return {
		Toggle,
	};
};

export default ImgStyles;