import { Str } from '@dynafer/utils';
import Options from '../Options';
import DOM from './dom/DOM';

const EditorContainer = (skin: string) => {
	const bodyId = DOM.Utils.CreateUEID('editor-body', false);
	const DefaultCSSId = DOM.Utils.CreateUEID('editor-default', false);
	const DefaultCss = `<link id="${DefaultCSSId}" rel="stylesheet" href="${Options.JoinURL('css', 'skins/Editor')}">`;

	const SkinCSSId = DOM.Utils.CreateUEID('skin', false);
	const SkinCSSLink = `<link id="${SkinCSSId}" rel="stylesheet" href="${Options.JoinURL('css', `skins/${skin}/skin`)}">`;

	const IFrame = (container: HTMLElement, bNoSkin: boolean = false): HTMLElement | null => {
		if (!DOM.Utils.IsIFrame(container)) return null;

		const doc = container.contentDocument;
		if (!doc) return null;

		const head = bNoSkin ? DefaultCss : Str.Merge(SkinCSSLink, DefaultCss);

		const iframeHTML = Str.Merge('<!DOCTYPE html>',
			'<html>',
			`<head>${head}</head>`,
			`<body id="${bodyId}" contenteditable="true"></body>`,
			'</html>');

		doc.write(iframeHTML);
		doc.close();

		return doc.body;
	};

	const Div = (container: HTMLElement): HTMLElement => {
		const containerBody = DOM.Create('div', {
			attrs: {
				id: bodyId,
				contenteditable: 'true'
			}
		});

		DOM.Insert(container, containerBody);

		return containerBody;
	};

	return {
		DefaultCSSId,
		DefaultCss,
		SkinCSSId,
		SkinCSSLink,
		IFrame,
		Div,
	};
};

export default EditorContainer;