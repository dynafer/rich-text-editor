import Editor from '../../Editor';

const MouseUpEvent = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const paths: Node[] = [];
	for (const path of event.composedPath()) {
		if (self.GetBody() === path) break;
		paths.push(path as Node);
	}
	editor.Dispatch('caret:change', paths);
};

export default MouseUpEvent;