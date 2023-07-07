import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';

const HoverFigure = (editor: Editor, event: MouseEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const PartsTool = self.Tools.Parts;

	if (self.IsAdjusting()) return;

	const caret = self.Utils.Caret.Get();
	if (caret?.IsRange()) return PartsTool.HideAll();

	const { Figure } = DOM.Element.Figure.Find<HTMLElement>(event.composedPath()[0]);
	if (!Figure) return PartsTool.HideAll();

	const parts = PartsTool.Manager.SelectParts(true, Figure);

	let target: HTMLElement | undefined;
	Arr.Each(parts, part => {
		if (DOM.Element.Figure.FindClosest(part) !== Figure) return;
		target = part;
	});
	PartsTool.HideAll(target);
	if (!target || !DOM.IsHidden(target)) return;

	PartsTool.Show(target);
	PartsTool.ChangePositions();
};

export default HoverFigure;