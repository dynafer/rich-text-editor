import { Arr, Obj } from '@dynafer/utils';
import Editor from 'finer/packages/Editor';
import { IPluginMediaMenuFormatUI } from '../utils/Type';
import { ATTRIBUTE_AS_TEXT } from '../utils/Utils';

const MediaStyles = (editor: Editor, format: IPluginMediaMenuFormatUI) => {
	const self = editor;
	const DOM = self.DOM;
	const { Styles, SameStyles, bAsText } = format;

	const wrapStyle = (media: HTMLElement) => {
		const figure = DOM.Element.Figure.GetClosest(media);
		if (!figure) return;

		Arr.Each(SameStyles, sameStyle => DOM.RemoveStyle(figure, sameStyle));
		const toggleAttr = bAsText ? DOM.SetAttr : DOM.RemoveAttr;
		toggleAttr(figure, ATTRIBUTE_AS_TEXT, '');

		DOM.SetStyles(figure, Styles);

		self.Utils.Shared.DispatchCaretChange([figure]);
	};

	const unwrapStyle = (media: HTMLElement) => {
		const figure = DOM.Element.Figure.GetClosest(media);
		if (!figure) return;

		if (bAsText) DOM.RemoveAttr(figure, ATTRIBUTE_AS_TEXT);

		Obj.Keys(Styles, style => DOM.RemoveStyle(figure, style));
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