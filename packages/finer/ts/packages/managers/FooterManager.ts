import { NodeType } from '@dynafer/dom-control';
import { Arr, Str } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { ENativeEvents } from '../events/EventSetupUtils';

export interface IFooterManager {
	UpdateCounter: () => void,
}

const navigationId = DOM.Utils.CreateUEID('navigation', false);
const counterId = DOM.Utils.CreateUEID('counter', false);
const wordCounterId = DOM.Utils.CreateUEID('counter-word', false);
const totalCounterId = DOM.Utils.CreateUEID('counter-total', false);

const CreateFooter = (): HTMLElement => {
	const create = (id: string): HTMLElement => DOM.Create('div', {
		attrs: { id },
		class: id
	});

	const createCounter = (label: string, id: string): HTMLElement => {
		const wrapper = DOM.Create('div', {
			class: DOM.Utils.CreateUEID('counter-wrap', false),
			children: [
				DOM.Create('div', {
					class: DOM.Utils.CreateUEID('label', false),
					html: Str.Merge(label, ':')
				}),
				create(id)
			]
		});
		return wrapper;
	};

	const footerId = DOM.Utils.CreateUEID('footer', false);
	const footer = create(footerId);

	const navigation = create(navigationId);

	const counter = create(counterId);
	DOM.Insert(counter, createCounter('Words', wordCounterId), createCounter('Total', totalCounterId));

	DOM.Insert(footer, navigation, counter);

	return footer;
};

const FooterManager = (editor: Editor): IFooterManager | null => {
	const self = editor;
	if (!self.Frame.Footer) return null;

	const footer = self.Frame.Footer;
	const navigation = DOM.Select({ attrs: { id: navigationId } }, footer);
	const wordCounter = DOM.Select({ attrs: { id: wordCounterId } }, footer);
	const totalCounter = DOM.Select({ attrs: { id: totalCounterId } }, footer);

	let regexBlockTags: RegExp;

	const UpdateCounter = () => {
		if (!regexBlockTags) regexBlockTags = new RegExp(`<\/?(${Str.Join('|', ...self.Formatter.Formats.AllBlockFormats)}).*?>`, 'g');
		const texts = DOM.GetHTML(self.GetBody())
			.replace(regexBlockTags, ' ')
			.replace(/<\/?.*?>/g, '')
			.replace(/\s{2,}/g, ' ')
			.trim();

		const total = texts.length;
		const words = (texts.replace(/\n/g, ' ').match(/\s/g)?.length ?? 0) + (total !== 0 ? 1 : 0);

		DOM.SetText(wordCounter, Str.Commaize(words));
		DOM.SetText(totalCounter, Str.Commaize(total));
	};

	const navigationClickEvent = (target: Element) => {
		const newRange = self.Utils.Range();

		const selectCells = (type: 'table' | 'row' | 'cell') => {
			const cells = DOM.Element.Table.GetSelectedCells(self);
			const bAlreadySelected = !Arr.IsEmpty(cells);
			self.Utils.Caret.CleanRanges();

			switch (type) {
				case 'table':
					return DOM.Element.Table.ToggleSelectMultipleCells(true, DOM.Element.Table.GetAllOwnCells(target));
				case 'row':
					const table = DOM.Element.Table.GetClosest(target);
					if (!table) return;

					if (!bAlreadySelected) return DOM.Element.Table.ToggleSelectMultipleCells(true, DOM.Element.Table.GetAllOwnCells(table, target));

					const rows: Element[] = [];
					Arr.Each(cells, cell => {
						const row = DOM.Element.Table.GetClosestRow(cell);
						if (!row || Arr.Contains(rows, row)) return;
						Arr.Push(rows, row);
					});

					const targetCells: Element[] = [];
					Arr.Each(rows, row => Arr.Push(targetCells, ...DOM.Element.Table.GetAllOwnCells(table, row)));

					return DOM.Element.Table.ToggleSelectMultipleCells(true, targetCells);
				case 'cell':
					if (bAlreadySelected) return;
					return DOM.Element.Table.ToggleSelectCell(true, target);
			}
		};

		const updateRange = () => {
			self.Utils.Caret.UpdateRange(newRange);
			self.Utils.Shared.DispatchCaretChange();
			self.Focus();
		};

		if (DOM.Element.Table.IsTable(target)) return selectCells('table');
		if (DOM.Element.Table.IsTableRow(target)) return selectCells('row');
		if (DOM.Element.Table.IsTableCell(target)) return selectCells('cell');

		if (DOM.Element.Figure.IsFigure(target)) {
			newRange.SetStartToEnd(target, 1, 1);
			return updateRange();
		}

		const start = DOM.Utils.GetFirstChild(target, true);
		const end = DOM.Utils.GetLastChild(target, true);

		if (!start || !end) {
			newRange.SelectContents(target);
			return updateRange();
		}

		newRange.SetStart(start, 0);
		newRange.SetEnd(end, NodeType.IsText(end) ? end.length : 0);
		updateRange();
	};

	const createNavigationItems = (elements: Element[]) => {
		DOM.RemoveChildren(navigation, true);
		Arr.Each(elements, element => {
			if (NodeType.IsText(element) || DOM.Utils.IsBr(element)) return;

			let elementName = DOM.Utils.GetNodeName(element);
			if (DOM.Element.Figure.IsFigure(element)) {
				const figureElement = DOM.Element.Figure.SelectFigureElement(element);
				if (figureElement)
					elementName = Str.Merge(elementName, '<', DOM.Utils.GetNodeName(figureElement), '>');
			}

			const navigationItem = DOM.Create('button', { attrs: { title: elementName } });
			DOM.SetText(navigationItem, elementName);

			DOM.On(navigationItem, ENativeEvents.click, () => navigationClickEvent(element));

			DOM.Insert(navigation, navigationItem);
		});
	};

	self.On(ENativeEvents.keydown, UpdateCounter);
	self.On(ENativeEvents.keyup, UpdateCounter);
	self.On(ENativeEvents.keypress, UpdateCounter);
	self.On('Caret:Change', () => {
		const caret = self.Utils.Caret.Get();
		const cells = DOM.Element.Table.GetSelectedCells(self);

		UpdateCounter();

		if (!caret && Arr.IsEmpty(cells)) return;

		if (!caret) return createNavigationItems(DOM.GetParents(cells[0]));

		createNavigationItems(caret.IsBackward() ? caret.Start.Path : caret.End.Path);
	});

	return {
		UpdateCounter,
	};
};

export {
	CreateFooter,
	FooterManager,
};