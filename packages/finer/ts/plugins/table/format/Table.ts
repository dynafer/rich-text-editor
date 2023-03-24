import Editor from '../../../packages/Editor';

const TableFormat = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const formats = self.Formatter.Formats;

	const CreateFromCaret = (rowNum: number, cellNum: number) => {
		self.Focus();
		const caretForDeletion = self.Utils.Caret.Get()[0];
		const bRange = caretForDeletion.IsRange();
		if (bRange) {
			caretForDeletion.Range.DeleteContents();
			self.Utils.Caret.Clean();
		}

		const caret = bRange ? self.Utils.Caret.Get()[0] : caretForDeletion;

		const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.Start.Node, caret.Start.Offset);

		const figure = DOM.Element.Figure.Create(formats.TableSelector);

		const table = DOM.Create(formats.TableSelector, {
			attrs: {
				border: '1',
				contenteditable: 'true',
			},
		});

		const tools = self.Tools.DOM.Create('table', table);

		let firstCell: HTMLElement = table;

		for (let rowIndex = 0; rowIndex <= rowNum; ++rowIndex) {
			const tr = DOM.Create(formats.TableRowSelector);

			for (let cellIndex = 0; cellIndex <= cellNum; ++cellIndex) {
				const cell = DOM.Create('td', {
					html: '<p><br></p>'
				});
				if (rowIndex === 0 && cellIndex === 0) firstCell = cell;
				DOM.Insert(tr, cell);
			}

			DOM.Insert(table, tr);
		}

		DOM.Insert(figure, table, tools);

		if (StartBlock && EndBlock) {
			DOM.InsertAfter(StartBlock, EndBlock, figure);
			caret.Range.SetStartToEnd(firstCell, 0, 0);
			self.Focus();
			return self.Utils.Shared.DispatchCaretChange([firstCell]);
		}

		const parentIfText = self.Formatter.Utils.GetParentIfText(caret.Start.Node);
		const nearTable = DOM.Closest(parentIfText, formats.TableSelector);
		if (!nearTable) {
			DOM.InsertAfter(caret.Start.Path[0], figure);
		} else {
			caret.Range.Insert(figure);
		}

		caret.Range.SetStartToEnd(firstCell, 0, 0);
		self.Focus();

		self.Utils.Shared.DispatchCaretChange([firstCell]);
	};

	return {
		CreateFromCaret
	};
};

export default TableFormat;