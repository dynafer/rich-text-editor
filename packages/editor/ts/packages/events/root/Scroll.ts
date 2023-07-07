import { EEditorMode } from '../../../Options';
import DOM from '../../dom/DOM';
import Editor from '../../Editor';
import { ENativeEvents } from '../EventSetupUtils';

const Scroll = (editor: Editor) => {
	const self = editor;
	if (self.Config.Mode !== EEditorMode.inline) return;

	const ATTRIBUTE_TRACE = 'inline-trace';

	const toolbarShuckId = DOM.Utils.CreateUEID('toolbar-shuck');

	const selectShuck = (): Element => DOM.Select({ attrs: { id: toolbarShuckId } }, self.Frame.Root);

	const setTrace = (bRemove: boolean, rect: DOMRect) => {
		if (bRemove) {
			DOM.RemoveStyles(self.Frame.Toolbar, 'top', 'left');
			DOM.RemoveAttr(self.Frame.Toolbar, ATTRIBUTE_TRACE);
			return DOM.Remove(selectShuck());
		}

		if (selectShuck()) return;

		DOM.SetAttr(self.Frame.Toolbar, ATTRIBUTE_TRACE);
		DOM.SetStyles(self.Frame.Toolbar, {
			top: '0px',
			left: `${rect.left}px`,
		});

		const toolbarShuck = DOM.Create('div', {
			attrs: { id: toolbarShuckId },
			styles: { height: `${rect.height}px` }
		});
		DOM.InsertAfter(self.Frame.Toolbar, toolbarShuck);
	};

	const hasTrace = () => DOM.HasAttr(self.Frame.Toolbar, ATTRIBUTE_TRACE);

	DOM.On(window, ENativeEvents.scroll, () => {
		const rect = DOM.GetRect(self.Frame.Toolbar);
		const editorRect = DOM.GetRect(self.Frame.Root);
		if (!rect || !editorRect) return;

		if (editorRect.top > 0) {
			if (!hasTrace()) return;
			return setTrace(true, rect);
		}

		if (hasTrace()) return;
		setTrace(false, rect);
	});
};

export default Scroll;