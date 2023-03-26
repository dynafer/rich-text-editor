import { Arr, Str } from '@dynafer/utils';
import Editor from '../../../packages/Editor';

const TableFormat = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const formatter = self.Formatter;

	const CreateFromCaret = (rowNum: number, cellNum: number) => {
		const figure = DOM.Element.Figure.Create(DOM.Element.Table.Selector);

		const table = DOM.Create(DOM.Element.Table.Selector, {
			attrs: {
				border: '1',
				contenteditable: 'true',
			},
		});

		const tools = self.Tools.DOM.Create('table', table);

		let firstCellParagraph: HTMLElement = table;

		for (let rowIndex = 0; rowIndex <= rowNum; ++rowIndex) {
			const tr = DOM.Create(DOM.Element.Table.RowSelector);

			for (let cellIndex = 0; cellIndex <= cellNum; ++cellIndex) {
				const paragraph = self.CreateEmptyParagraph();
				const cell = DOM.Create('td', {
					children: [paragraph]
				});
				if (rowIndex === 0 && cellIndex === 0) firstCellParagraph = paragraph;
				DOM.Insert(tr, cell);
			}

			DOM.Insert(table, tr);
		}

		DOM.Insert(figure, table, tools);

		self.Focus();

		self.Tools.DOM.UnsetAllFocused();
		CaretUtils.Get()[0]?.Range.DeleteContents();
		formatter.Utils.CleanDirty(self, CaretUtils.Get()[0]);

		const caret = CaretUtils.Get()[0];
		const lines = DOM.GetChildren(self.GetBody());

		const finish = () => {
			const newRange = self.Utils.Range();
			newRange.SetStartToEnd(firstCellParagraph, 1, 1);
			CaretUtils.UpdateRanges(newRange);
			self.Utils.Shared.DispatchCaretChange([firstCellParagraph]);
		};

		if (!caret) {
			const insert = Arr.IsEmpty(lines) ? DOM.Insert : DOM.InsertAfter;
			const target = Arr.IsEmpty(lines) ? self.GetBody() : lines[0];
			insert(target, figure);
			return finish();
		}

		const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.Start.Node, caret.Start.Offset);

		const node = formatter.Utils.GetParentIfText(caret.Start.Node);
		const blockNode = StartBlock ?? DOM.Closest(node, Str.Join(',', ...formatter.Formats.BlockFormatTags.Block)) ?? lines[0];
		const insert = !blockNode ? DOM.Insert : DOM.InsertAfter;
		const insertions = !blockNode ? [figure, EndBlock] : [EndBlock, figure];
		insert(blockNode ?? self.GetBody(), ...insertions);

		finish();
	};

	return {
		CreateFromCaret
	};
};

export default TableFormat;