import Editor from '../../Editor';

const PointerEvent = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;
	const paths: Node[] = [];
	for (const path of event.composedPath()) {
		if (self.GetBody() === path) break;
		paths.push(path as Node);
	}
	self.Dispatch('caret:change', paths);
};

export default PointerEvent;