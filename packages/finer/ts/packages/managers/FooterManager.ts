import { NodeType } from '@dynafer/dom-control';
import { Arr, Str } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { ENativeEvents, PreventEvent } from '../events/EventSetupUtils';
import { AllBlockFormats } from '../formatter/Format';

export interface IFooterManager {
	UpdateCounter: () => void,
	CleanNavigation: () => void,
}

const navigationId = DOM.Utils.CreateUEID('navigation', false);
const counterId = DOM.Utils.CreateUEID('counter', false);
const wordCounterId = DOM.Utils.CreateUEID('counter-word', false);
const totalCounterId = DOM.Utils.CreateUEID('counter-total', false);

const FooterManager = (editor: Editor): IFooterManager | null => {
	const self = editor;

	const create = (id: string): HTMLElement => DOM.Create('div', {
		attrs: { id },
		class: id
	});

	const createCounter = (label: string, id: string): HTMLElement => {
		const wrapper = DOM.Create('div', {
			class: DOM.Utils.CreateUEID('counter-wrap', false),
			children: [
				DOM.Create('div', {
					attrs: { title: label },
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
	const wordCounterWrapper = createCounter(self.Lang('counter.words', 'Words'), wordCounterId);
	const totalCounterWrapper = createCounter(self.Lang('counter.total', 'Total'), totalCounterId);
	DOM.Insert(counter, wordCounterWrapper, totalCounterWrapper);

	DOM.Insert(footer, navigation, counter);

	DOM.InsertAfter(self.Frame.Container, footer);

	const wordCounter = DOM.Select({ attrs: { id: wordCounterId } }, wordCounterWrapper);
	const totalCounter = DOM.Select({ attrs: { id: totalCounterId } }, totalCounterWrapper);

	let regexBlockTags: RegExp;

	const UpdateCounter = () => {
		if (!regexBlockTags) regexBlockTags = new RegExp(`<\/?(${Str.Join('|', ...AllBlockFormats)}).*?>`, 'g');
		const clonedBody = DOM.Clone(self.GetBody(), true);
		Arr.WhileShift(DOM.SelectAll({ attrs: { dataFixed: 'dom-tool' } }, clonedBody), tools => DOM.Remove(tools));
		const texts = DOM.GetHTML(clonedBody)
			.replace(regexBlockTags, ' ')
			.replace(/<\/?.*?>/g, '')
			.replace(/\s{2,}/g, ' ')
			.trim();

		const total = texts.length;
		const words = (texts.replace(/\n/g, ' ').match(/\s/g)?.length ?? 0) + (total !== 0 ? 1 : 0);

		DOM.SetText(wordCounter, Str.Commaize(words));
		DOM.SetText(totalCounter, Str.Commaize(total));
	};

	const CleanNavigation = () => DOM.RemoveChildren(navigation, true);

	const navigationClickEvent = (target: Element) => {
		const newRange = self.Utils.Range();

		const finish = () => {
			self.Utils.Shared.DispatchCaretChange();
			self.Focus();
		};

		const updateRange = () => {
			self.Utils.Caret.UpdateRange(newRange);
			finish();
		};

		const selectCells = (type: 'table' | 'row' | 'cell') => {
			const cells = DOM.Element.Table.GetSelectedCells(self);
			const bAlreadySelected = !Arr.IsEmpty(cells);
			self.Utils.Caret.CleanRanges();

			switch (type) {
				case 'table':
					return DOM.Element.Table.ToggleSelectMultipleCells(true, DOM.Element.Table.GetAllOwnCells(target));
				case 'row':
					const table = DOM.Element.Table.FindClosest(target);
					if (!table) return;

					if (!bAlreadySelected) return DOM.Element.Table.ToggleSelectMultipleCells(true, DOM.Element.Table.GetAllOwnCells(target ?? table));

					const rows: Element[] = [];
					Arr.Each(cells, cell => {
						const row = DOM.Element.Table.FindClosestRow(cell);
						if (!row || Arr.Contains(rows, row)) return;
						Arr.Push(rows, row);
					});

					const targetCells: Element[] = [];
					Arr.Each(rows, row => Arr.Push(targetCells, ...DOM.Element.Table.GetAllOwnCells(row)));

					return DOM.Element.Table.ToggleSelectMultipleCells(true, targetCells);
				case 'cell':
					if (bAlreadySelected) return;
					return DOM.Element.Table.ToggleSelectCell(true, target);
			}
		};

		if (DOM.Element.Table.Is(target)) {
			selectCells('table');
			return finish();
		}

		if (DOM.Element.Table.IsRow(target)) {
			selectCells('row');
			return finish();
		}

		if (DOM.Element.Table.IsCell(target)) {
			selectCells('cell');
			return finish();
		}


		if (DOM.Element.Figure.Is(target)) {
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
		CleanNavigation();
		Arr.Each(elements, element => {
			if (NodeType.IsText(element) || DOM.Utils.IsBr(element)) return;

			let elementName = DOM.Utils.GetNodeName(element);
			if (DOM.Element.Figure.Is(element)) {
				const figureElement = DOM.Element.Figure.SelectFigureElement(element);
				if (figureElement)
					elementName = Str.Merge(elementName, '<', DOM.Utils.GetNodeName(figureElement), '>');
			}

			const navigationItem = DOM.Create('button', { attrs: { title: elementName } });
			DOM.SetText(navigationItem, elementName);

			DOM.On(navigationItem, ENativeEvents.click, event => {
				PreventEvent(event);
				navigationClickEvent(element);
			});

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
		CleanNavigation,
	};
};

export default FooterManager;