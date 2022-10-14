import DOM from 'finer/packages/dom/DOM';
import { CreateUEID } from 'dynafer/utils/Option';

const EditorFrame = (selector: HTMLElement, mode: string, width: string, height: string) => {
	const tagName: string = mode === 'classic' ? 'iframe' : 'div';

	const frame = DOM.Create(tagName, {
		attrs: {
			id: CreateUEID('frame', false),
			frameborder: '0',
		},
		styles: {
			width: width,
			height: height
		},
		class: CreateUEID(mode, false)
	});

	DOM.InsertAfter(selector, frame);
};

export default EditorFrame;