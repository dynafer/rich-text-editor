import { NodeType } from '@dynafer/dom-control';
import Editor from '../../Editor';
import FormatUtils from '../../formatter/FormatUtils';
import { ENativeEvents, PreventEvent } from '../EventSetupUtils';

const DragMedia = (editor: Editor, event: DragEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const target = event.target;
	if (!NodeType.IsNode(target)) return;

	const targetName = DOM.Utils.GetNodeName(target);
	const bFigure = DOM.Element.Figure.IsFigure(target);
	if ((!DOM.Element.Figure.FigureTypeSetMap.media.has(targetName)
		&& !DOM.Element.Figure.FigureTypeSetMap.hr.has(targetName))
		&& !bFigure
	) return;

	const { Figure, FigureType, FigureElement } = DOM.Element.Figure.Find(target);
	if (bFigure && (!Figure || !FigureType || !FigureElement)) return;

	const figureElement = (bFigure ? FigureElement : event.target) as HTMLElement;

	event.dataTransfer?.setData('text/html', DOM.GetOuterHTML(figureElement));
	event.dataTransfer?.setDragImage(figureElement, 0, 0);

	const moveCaret = (startBlock: Node | null, endBlock: Node | null) => {
		let figure = Figure ?? figureElement.parentElement;
		if (!DOM.Element.Figure.IsFigure(figure)) {
			const figureType = DOM.Element.Figure.FindType(targetName);
			figure = DOM.Element.Figure.Create(targetName);
			DOM.Insert(figure, figureElement);

			const tools = self.Tools.DOM.Create(figureType, figureElement);
			DOM.Insert(figure, tools);
		}

		DOM.InsertAfter(startBlock, endBlock, figure);
		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(figure, 1, 1);
		CaretUtils.UpdateRange(newRange);
	};

	const dropMedia = (e: InputEvent) => {
		PreventEvent(e);
		self.Off(ENativeEvents.beforeinput, dropMedia);

		const caret = CaretUtils.Get();
		if (!caret) return;

		const closestFigure = DOM.Element.Figure.GetClosest(FormatUtils.GetParentIfText(caret.Start.Node));
		if (closestFigure === (figureElement.parentElement ?? figureElement)) return;

		if (!NodeType.IsText(caret.SameRoot)) return moveCaret(caret.Start.Path[0], null);

		const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.SameRoot, caret.Start.Offset);
		moveCaret(StartBlock, EndBlock);
	};

	self.On(ENativeEvents.beforeinput, dropMedia, true);
};

export default DragMedia;