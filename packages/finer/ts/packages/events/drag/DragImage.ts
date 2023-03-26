import { NodeType } from '@dynafer/dom-control';
import Editor from '../../Editor';
import FormatUtils from '../../formatter/FormatUtils';
import { ENativeEvents, PreventEvent } from '../EventSetupUtils';

const DragImage = (editor: Editor, event: DragEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	if (DOM.Utils.GetNodeName(event.target as Node) !== 'img') return;

	const image = event.target as HTMLImageElement;

	event.dataTransfer?.setData('text/html', DOM.GetOuterHTML(image));
	event.dataTransfer?.setDragImage(image, 0, 0);

	const moveCaret = (startBlock: Node | null, endBlock: Node | null) => {
		let figure = image.parentNode;
		if (!DOM.Element.Figure.IsFigure(figure)) {
			figure = DOM.Element.Figure.Create('img');
			DOM.Insert(figure, image);

			const tools = self.Tools.DOM.Create('img', image);
			DOM.Insert(figure, tools);
		}

		DOM.InsertAfter(startBlock, endBlock, figure);
		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(figure, 1, 1);
		CaretUtils.UpdateRanges(newRange);
	};

	const dropImage = (e: InputEvent) => {
		PreventEvent(e);
		DOM.Off(self.GetBody(), ENativeEvents.beforeinput, dropImage);

		const caret = CaretUtils.Get()[0];
		if (!caret) return CaretUtils.Clean();

		const closestFigure = DOM.Element.Figure.GetClosest(FormatUtils.GetParentIfText(caret.Start.Node));
		if (closestFigure === (image.parentElement ?? image)) return CaretUtils.Clean();

		if (!NodeType.IsText(caret.SameRoot)) return moveCaret(caret.Start.Path[0], null);

		const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.SameRoot, caret.Start.Offset);
		moveCaret(StartBlock, EndBlock);
	};

	DOM.On(self.GetBody(), ENativeEvents.beforeinput, dropImage);
};

export default DragImage;