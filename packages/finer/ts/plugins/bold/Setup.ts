import Editor from '../../packages/Editor';
import { ICaretData } from '../../packages/editorUtils/CaretUtils';
import { ACTIVE, TAG_NAME } from './Constants';

const Setup = (editor: Editor, ui: HTMLElement) => {
	const self = editor;
	let bActive = false;

	const activate = (bActivation: boolean) => {
		bActive = bActivation;
		if (bActive) {
			self.GetRootDOM().AddClass(ui, ACTIVE);
		} else {
			self.GetRootDOM().RemoveClass(ui, ACTIVE);
		}
	};

	const apply = () => {
		const carets: ICaretData[] = self.Utils.Caret.Get();
		const newRanges: Range[] = [];
		const caretId = self.DOM.Utils.CreateUEID('caret', false);

		for (let index = 0, length = carets.length; index < length; ++ index) {
			const caret = carets[index];
			if (!caret.IsRange()) {
				const caretPointer = self.DOM.Create('span', {
					attrs: {
						id: caretId,
						caret: index.toString()
					},
					html: editor.DOM.Utils.CreateEmptyHTML(TAG_NAME)
				});

				caret.Range.insertNode(caretPointer);

				caret.Range.setStartAfter(caretPointer);
				newRanges.push(caret.Range.cloneRange());
			}
		}

		self.Utils.Caret.UpdateRanges(newRanges);
	};

	const release = () => {
		// fix me ...
	};

	self.GetRootDOM().On(ui, 'click', () => {
		self.Focus();
		if (!bActive) {
			activate(true);
			apply();
		} else {
			activate(false);
			release();
		}
	});

	self.Plugin.DetectByTagName(TAG_NAME, activate);
};

export default Setup;