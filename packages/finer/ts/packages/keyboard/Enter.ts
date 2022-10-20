import Editor from 'finer/packages/Editor';

const EnterEvent = (editor: Editor, event: KeyboardEvent) => {
	event.preventDefault();

	const self = editor;

	self.DOM.Insert(self.EditArea, '<p><br></p>');
	self.EditArea.scrollTo(0, self.EditArea.scrollHeight);
	self.Utils.Caret.Set(self.EditArea.lastChild as Node, 0);
};

export default EnterEvent;