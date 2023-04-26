import { Str } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import FormatUI from '../formatter/FormatUI';

const HorizontalLine = (editor: Editor) => {
	const self = editor;

	const Name = 'HorizontalLine';
	const title = self.Lang('toolbar.horizontal.line', 'Horizontal Line');

	const createLine = (): HTMLElement => {
		const figure = DOM.Element.Figure.Create('hr');
		const horizontalLine = self.DOM.Create('hr');
		horizontalLine.draggable = true;
		DOM.Insert(figure, horizontalLine);

		return figure;
	};

	const createCommand = () => {
		const CaretUtils = self.Utils.Caret;

		const horizontalLine = createLine();

		const finish = () => {
			const newRange = self.Utils.Range();
			newRange.SetStartToEnd(horizontalLine, 1, 1);
			CaretUtils.UpdateRange(newRange);
			self.Utils.Shared.DispatchCaretChange([horizontalLine]);
			self.Focus();
		};

		const caret = CaretUtils.Get();
		if (!caret) {
			const cells = DOM.Element.Table.GetSelectedCells(self);
			const figure = DOM.Element.Figure.FindClosest(cells[0] ?? null);
			DOM.InsertAfter(figure ?? self.GetBody(), horizontalLine);
			return finish();
		}

		self.Utils.Shared.DeleteRange(caret);
		CaretUtils.Refresh();

		const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.Start.Node, caret.Start.Offset);
		DOM.InsertAfter(StartBlock ?? caret.Start.Path[0], EndBlock, horizontalLine);

		if (!DOM.Element.Figure.Is(StartBlock) && Str.IsEmpty(DOM.GetText(StartBlock))) DOM.Remove(StartBlock);
		if (!DOM.Element.Figure.Is(EndBlock) && Str.IsEmpty(DOM.GetText(EndBlock))) DOM.Remove(EndBlock);

		finish();
	};

	const Create = (): HTMLElement => {
		const button = FormatUI.CreateIconButton(title, Name);

		self.Commander.Register(Name, createCommand);

		FormatUI.BindClickEvent(button, () => self.Commander.Run(Name));

		return button;
	};

	return {
		Name: 'Hr',
		Create,
	};
};

export default HorizontalLine;