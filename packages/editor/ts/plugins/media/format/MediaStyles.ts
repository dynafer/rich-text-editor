import { Obj } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../../packages/Editor';
import { IPluginMediaCommand } from '../utils/Type';

const MediaStyles = (editor: Editor, format: IPluginMediaCommand) => {
	const self = editor;
	const DOM = self.DOM;
	const { Styles, SameStyles, bAsText } = format;

	const wrapStyle = (media: HTMLElement): HTMLElement | null => {
		const figure = DOM.Element.Figure.FindClosest(media);
		if (!figure) return null;

		DOM.RemoveStyles(figure, ...SameStyles);
		const toggleAttr = bAsText ? DOM.SetAttr : DOM.RemoveAttr;
		toggleAttr(figure, Options.ATTRIBUTES.AS_TEXT);

		DOM.SetStyles(figure, Styles);
		return figure;
	};

	const unwrapStyle = (media: HTMLElement): HTMLElement | null => {
		const figure = DOM.Element.Figure.FindClosest(media);
		if (!figure) return null;

		if (bAsText) DOM.RemoveAttr(figure, Options.ATTRIBUTES.AS_TEXT);

		DOM.RemoveStyles(figure, ...Obj.Keys(Styles));
		return figure;
	};

	const Toggle = (bWrap: boolean, media: HTMLElement) => {
		const toggle = bWrap ? wrapStyle : unwrapStyle;
		const figure = toggle(media);
		if (figure) return self.Utils.Shared.DispatchCaretChange([figure]);
		self.Tools.Parts.ChangePositions();
	};

	return {
		Toggle,
	};
};

export default MediaStyles;