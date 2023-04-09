import { Str } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { ENativeEvents } from '../events/EventSetupUtils';

const HorizontalLine = (editor: Editor) => {
	const self = editor;

	const title = Finer.ILC.Get('toolbar.horizontal.line') ?? 'Horizontal Line';

	const createLine = (): HTMLElement => {
		const figure = DOM.Element.Figure.Create('hr');
		const horizontalLine = self.DOM.Create('hr');
		DOM.Insert(figure, horizontalLine);

		return figure;
	};

	const Create = () => {
		const button = DOM.Create('button', {
			attrs: { title },
			class: DOM.Utils.CreateUEID('icon-button', false),
			html: Finer.Icons.Get('HorizontalLine')
		});

		DOM.On(button, ENativeEvents.click, () => {
			const CaretUtils = self.Utils.Caret;

			const horizontalLine = createLine();

			const finish = () => {
				const newRange = self.Utils.Range();
				newRange.SetStartToEnd(horizontalLine, 1, 1);
				CaretUtils.UpdateRange(newRange);
				self.Utils.Shared.DispatchCaretChange([horizontalLine]);
			};

			const caret = CaretUtils.Get();
			if (!caret) {
				const cells = DOM.Element.Table.GetSelectedCells(self);
				const figure = DOM.Element.Figure.GetClosest(cells[0] ?? null);
				DOM.InsertAfter(figure ?? self.GetBody(), horizontalLine);
				return finish();
			}

			caret.Range.DeleteContents();
			CaretUtils.Refresh();

			const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.Start.Node, caret.Start.Offset);
			DOM.InsertAfter(StartBlock ?? caret.Start.Path[0], EndBlock, horizontalLine);

			if (!DOM.Element.Figure.IsFigure(StartBlock) && Str.IsEmpty(DOM.GetText(StartBlock))) DOM.Remove(StartBlock);
			if (!DOM.Element.Figure.IsFigure(EndBlock) && Str.IsEmpty(DOM.GetText(EndBlock))) DOM.Remove(EndBlock);

			return finish();
		});

		return button;
	};

	return {
		Name: 'Hr',
		Create,
	};
};

export default HorizontalLine;