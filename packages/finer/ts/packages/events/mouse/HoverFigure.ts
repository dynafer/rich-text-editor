import { Arr } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';

const HoverFigure = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const DOMTools = self.Tools.DOM;

	if (DOM.HasAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING)) return;

	const caret = self.Utils.Caret.Get();
	if (caret?.IsRange()) return DOMTools.HideAll();

	const { Figure } = DOM.Element.Figure.Find<HTMLElement>(event.composedPath()[0]);
	if (!Figure) return DOMTools.HideAll();

	const tools = DOMTools.Manager.SelectTools(true, Figure);

	let target: HTMLElement | undefined;
	Arr.Each(tools, tool => {
		if (DOM.Element.Figure.GetClosest(tool) !== Figure) return;
		target = tool;
	});
	DOMTools.HideAll(target);
	if (target) DOMTools.Show(target);

	DOMTools.ChangePositions();
};

export default HoverFigure;