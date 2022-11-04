import Editor from '../../packages/Editor';
import { ACTIVE, TAG_NAME } from './Constants';

const Setup = (editor: Editor, ui: HTMLElement) => {
	const self = editor;
	const DOM = self.GetRootDOM();
	let bActive = false;

	const activate = (bActivation: boolean) => {
		bActive = bActivation;
		if (bActive) {
			DOM.AddClass(ui, ACTIVE);
		} else {
			DOM.RemoveClass(ui, ACTIVE);
		}
	};

	DOM.On(ui, 'click', () => {
		self.Focus();
		if (!bActive) {
			activate(true);
			self.Plugin.ApplyByTagName(TAG_NAME);
		} else {
			activate(false);
			self.Plugin.ReleaseByTagName(TAG_NAME);
		}
	});

	self.Plugin.DetectByTagName(TAG_NAME, activate);
};

export default Setup;