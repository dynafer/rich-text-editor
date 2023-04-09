import { Obj } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../../packages/Editor';
import { IPluginMediaMenuFormatUI } from '../utils/Type';

const MediaStyles = (editor: Editor, format: IPluginMediaMenuFormatUI) => {
	const self = editor;
	const DOM = self.DOM;
	const { Styles, SameStyles, bAsText } = format;

	const wrapStyle = (media: HTMLElement) => {
		const figure = DOM.Element.Figure.GetClosest(media);
		if (!figure) return;

		DOM.RemoveStyles(figure, ...SameStyles);
		const toggleAttr = bAsText ? DOM.SetAttr : DOM.RemoveAttr;
		toggleAttr(figure, Options.ATTRIBUTE_AS_TEXT);

		DOM.SetStyles(figure, Styles);

		self.Utils.Shared.DispatchCaretChange([figure]);
	};

	const unwrapStyle = (media: HTMLElement) => {
		const figure = DOM.Element.Figure.GetClosest(media);
		if (!figure) return;

		if (bAsText) DOM.RemoveAttr(figure, Options.ATTRIBUTE_AS_TEXT);

		DOM.RemoveStyles(figure, ...Obj.Keys(Styles));
		self.Utils.Shared.DispatchCaretChange([figure]);
	};

	const Toggle = (bWrap: boolean, media: HTMLElement) => {
		const toggle = bWrap ? wrapStyle : unwrapStyle;
		toggle(media);
	};

	return {
		Toggle,
	};
};

export default MediaStyles;