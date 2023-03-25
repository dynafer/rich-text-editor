import { Arr, Obj } from '@dynafer/utils';
import Editor from 'finer/packages/Editor';
import { IPluginImageMenuFormatUI } from '../utils/Type';
import { ATTRIBUTE_AS_TEXT } from '../utils/Utils';

const ImgStyles = (editor: Editor, format: IPluginImageMenuFormatUI) => {
	const self = editor;
	const DOM = self.DOM;
	const { Styles, SameStyles, bAsText } = format;

	const wrapStyle = (image: HTMLElement) => {
		const figure = DOM.Element.Figure.GetClosest(image);
		if (!figure) return;

		Arr.Each(SameStyles, sameStyle => DOM.RemoveStyle(figure, sameStyle));
		const toggleAttr = bAsText ? DOM.SetAttr : DOM.RemoveAttr;
		toggleAttr(figure, ATTRIBUTE_AS_TEXT, '');

		DOM.SetStyles(figure, Styles);
		self.Utils.Shared.DispatchCaretChange([figure]);
	};

	const unwrapStyle = (image: HTMLElement) => {
		const figure = DOM.Element.Figure.GetClosest(image);
		if (!figure) return;

		if (bAsText) DOM.RemoveAttr(figure, ATTRIBUTE_AS_TEXT);

		Obj.Keys(Styles, style => DOM.RemoveStyle(figure, style));
		self.Utils.Shared.DispatchCaretChange([figure]);
	};

	const Toggle = (bWrap: boolean, image: HTMLElement) => {
		const toggle = bWrap ? wrapStyle : unwrapStyle;
		toggle(image);
	};

	return {
		Toggle,
	};
};

export default ImgStyles;