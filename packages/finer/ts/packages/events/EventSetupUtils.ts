import Editor from '../Editor';

export enum EEventNames {
	keydown = 'keydown',
	keyup = 'keyup',
	keypress = 'keypress',

	mousedown = 'mousedown',
	mouseup = 'mouseup',
	click = 'click',

	focus = 'focus',
	focusin = 'focusin',
	focusout = 'focusout'
}

export interface IEventSetupCallback<K extends keyof GlobalEventHandlersEventMap> {
	(editor: Editor, event: GlobalEventHandlersEventMap[K]): void
}

export const Setup = <K extends keyof GlobalEventHandlersEventMap>(editor: Editor, eventName: K, event: IEventSetupCallback<K>) => {
	editor.On(eventName, (evt: GlobalEventHandlersEventMap[K]) => {
		event(editor, evt);
	});
};

export const CaretChangeEvent = <K extends keyof GlobalEventHandlersEventMap>(editor: Editor, event: GlobalEventHandlersEventMap[K]) => {
	const self = editor;
	const paths: Node[] = [];
	for (const path of event.composedPath()) {
		if (self.DOM.Utils.IsParagraph(path as Node) || self.GetBody() === path || self.DOM.GetRoot() === path) break;
		paths.push(path as Node);
	}
	editor.Dispatch('caret:change', paths);
};