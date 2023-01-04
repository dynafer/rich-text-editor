import Editor from '../../../packages/Editor';

const TableFormat = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const formatterFormats = self.Formatter.Formats;

	const CreateFromCaret = (row: number, column: number) => {
		const caretForDeletion = self.Utils.Caret.Get()[0];
		const bRange = caretForDeletion.IsRange();
		if (bRange) {
			caretForDeletion.Range.DeleteContents();
			self.Utils.Caret.Clean();
		}

		const caret = bRange ? self.Utils.Caret.Get()[0] : caretForDeletion;

		const figure = DOM.Create(formatterFormats.FigureSelector, {
			attrs: {
				type: formatterFormats.TableSelector,
				contenteditable: 'false',
			},
		});

		const table = DOM.Create(formatterFormats.TableSelector, {
			attrs: {
				border: '1',
				contenteditable: 'true',
			},
		});

		let firstCell: HTMLElement = table;

		for (let rowIndex = 0; rowIndex <= row; ++rowIndex) {
			const tr = DOM.Create(formatterFormats.TableRowSelector);

			for (let columnIndex = 0; columnIndex <= column; ++columnIndex) {
				const cell = DOM.Create('td', {
					html: '<br>'
				});
				if (rowIndex === 0 && columnIndex === 0) firstCell = cell;
				DOM.Insert(tr, cell);
			}

			DOM.Insert(table, tr);
		}

		DOM.Insert(figure, table);
		DOM.InsertAfter(caret.Start.Path[0], figure);

		caret.Range.SetStartToEnd(firstCell, 0, 0);
		self.Focus();
	};

	return {
		CreateFromCaret
	};
};

export default TableFormat;