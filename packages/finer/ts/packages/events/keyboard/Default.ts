import { Str } from '@dynafer/utils';
import Editor from '../../Editor';

const DefaultEvent = (editor: Editor, event: KeyboardEvent) => {
	const self = editor;

	if (Str.IsEmpty(self.GetBody().innerHTML)) {
		event.preventDefault();
		event.stopPropagation();
		self.InitContent();
	}
};

export default DefaultEvent;