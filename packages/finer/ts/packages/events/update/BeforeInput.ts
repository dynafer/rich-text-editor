import { Arr, Str } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { EInputEventType, PreventEvent } from '../EventSetupUtils';

const BeforeInputEvent = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	let fakeFragment: DocumentFragment | null;

	const cleanUnusable = (fragment: DocumentFragment) => {
		const styleElements = fragment.querySelectorAll('[style]');

		for (const styleElement of styleElements) {
			const editorStyle = DOM.GetAttr(styleElement, Options.EDITOR_STYLE_ATTRIBUTE) ?? '';
			if (!Str.IsEmpty(editorStyle)) {
				DOM.SetStyleText(styleElement as HTMLElement, editorStyle);
				continue;
			}

			if (DOM.GetTagName(styleElement) !== 'span') {
				DOM.RemoveAttr(styleElement, 'style');
				continue;
			}

			if (!styleElement.parentNode) continue;

			const children = Array.from(styleElement.childNodes);

			if (Arr.IsEmpty(children)) {
				if (!styleElement.parentElement) continue;

				if (Str.IsEmpty(DOM.GetText(styleElement.parentElement))) styleElement.parentElement.remove();
				else styleElement.remove();
				continue;
			}

			styleElement.parentNode.replaceChild(children[0], styleElement);
			DOM.InsertAfter(children[0], children.slice(1, children.length));
		}
	};

	const getAsStringCallback = (html: string) => {
		const caret = CaretUtils.Get()[0];
		caret.Range.DeleteContents();
		const fragment = DOM.Create('fragment');
		DOM.SetHTML(fragment, Str.Contains(html, '<!--StartFragment-->') ? html.split('StartFragment-->')[1].split('<!--EndFragment')[0] : html);
		fakeFragment = DOM.CreateFragment();
		DOM.Insert(fakeFragment, Array.from(fragment.childNodes));

		cleanUnusable(fakeFragment);

		caret.Range.Insert(fakeFragment);
		fakeFragment = null;
	};

	const deleteByDragEvent = (event: InputEvent) => {
		PreventEvent(event);
		const caret = CaretUtils.Get()[0];
		fakeFragment = caret.Range.Extract();
		CaretUtils.Clean();
		return;
	};

	const insertFromDropEvent = (event: InputEvent) => {
		PreventEvent(event);
		if (!fakeFragment) return;

		const caret = CaretUtils.Get()[0];
		cleanUnusable(fakeFragment);
		caret.Range.Insert(fakeFragment);
		fakeFragment = null;
	};

	const GetEvent = (_editor: Editor, event: InputEvent) => {
		switch (event.inputType) {
			case EInputEventType.deleteByDrag:
				deleteByDragEvent(event);
				return;
			case EInputEventType.insertFromDrop:
				insertFromDropEvent(event);
				return;
			default:
				const inputType = Str.LowerCase(event.inputType);
				if (Str.Contains(inputType, 'delete') || Str.Contains(inputType, 'text') || !event.dataTransfer) return;
				for (const data of event.dataTransfer.items) {
					if (!Str.Contains(data.type, 'html')) continue;
					PreventEvent(event);

					data.getAsString(getAsStringCallback);
				}
				return;
		}
	};

	return {
		GetEvent
	};
};

export default BeforeInputEvent;