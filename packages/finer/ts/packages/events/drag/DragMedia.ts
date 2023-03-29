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
	if (!DOM.Element.Figure.FigureTypeSetMap.media.has(targetName) && !bFigure) return;

	const { Figure, FigureType, FigureElement } = DOM.Element.Figure.Find(target);
	if (bFigure && (!Figure || !FigureType || !FigureElement)) return;

	const media = (bFigure ? FigureElement : event.target) as HTMLElement;

	event.dataTransfer?.setData('text/html', DOM.GetOuterHTML(media));
	event.dataTransfer?.setDragImage(media, 0, 0);

	const moveCaret = (startBlock: Node | null, endBlock: Node | null) => {
		let figure = Figure ?? media.parentElement;
		if (!DOM.Element.Figure.IsFigure(figure)) {
			const figureType = DOM.Element.Figure.FindType(targetName);
			figure = DOM.Element.Figure.Create(targetName);
			DOM.Insert(figure, media);

			const tools = self.Tools.DOM.Create(figureType, media);
			DOM.Insert(figure, tools);
		}

		DOM.InsertAfter(startBlock, endBlock, figure);
		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(figure, 1, 1);
		CaretUtils.UpdateRanges(newRange);
	};

	const dropMedia = (e: InputEvent) => {
		PreventEvent(e);
		DOM.Off(self.GetBody(), ENativeEvents.beforeinput, dropMedia);

		const caret = CaretUtils.Get()[0];
		if (!caret) return CaretUtils.Clean();

		const closestFigure = DOM.Element.Figure.GetClosest(FormatUtils.GetParentIfText(caret.Start.Node));
		if (closestFigure === (media.parentElement ?? media)) return CaretUtils.Clean();

		if (!NodeType.IsText(caret.SameRoot)) return moveCaret(caret.Start.Path[0], null);

		const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.SameRoot, caret.Start.Offset);
		moveCaret(StartBlock, EndBlock);
	};

	DOM.On(self.GetBody(), ENativeEvents.beforeinput, dropMedia);
};

export default DragMedia;