import { Arr, Type } from '@dynafer/utils';
import Options from '../../../../Options';
import Editor from '../../../Editor';
import { ICaretData } from '../../../editorUtils/caret/CaretUtils';
import { ITableGrid } from '../../elements/Table';

type TCurrentPoint = ICaretData | HTMLElement[] | null | undefined;

interface IFakeFigure {
	readonly Figure: HTMLElement,
	readonly Table: HTMLElement,
}

const getComputedMargin = (editor: Editor, selector: HTMLElement, type: 'left' | 'top'): number =>
	parseFloat(editor.DOM.GetStyle(selector, `margin-${type}`, true));

const getOriginalPosition = (editor: Editor, fakeFigure: IFakeFigure, type: 'left' | 'top'): number =>
	(type === 'left' ? fakeFigure.Figure.offsetLeft : fakeFigure.Figure.offsetTop)
	- getComputedMargin(editor, fakeFigure.Figure, type);

const getOriginalMediaPosition = (editor: Editor, fakeFigure: IFakeFigure, type: 'left' | 'top'): number =>
	getComputedMargin(editor, fakeFigure.Table, type);

export const CreateCurrentPoint = (editor: Editor, table: HTMLElement): TCurrentPoint => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	let point: TCurrentPoint = CaretUtils.Get();
	CaretUtils.CleanRanges();

	if (!point) point = DOM.Element.Table.GetSelectedCells(self, table);

	return point;
};

export const MoveToCurrentPoint = (editor: Editor, table: HTMLElement, point: TCurrentPoint) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	const selectedCells = DOM.Element.Table.GetSelectedCells(self, table);
	DOM.Element.Table.ToggleSelectMultipleCells(false, selectedCells);

	if (!point) {
		const firstCell = DOM.SelectAll(DOM.Element.Table.CellSelector, table)[0];
		if (!firstCell) return;

		const firstChild = DOM.Utils.GetFirstChild(firstCell, true);
		if (!firstChild) return;

		const newRange = self.Utils.Range();
		newRange.SetStartToEnd(firstChild, 0, 0);
		return CaretUtils.UpdateRange(newRange);
	}

	if (Type.IsArray(point)) {
		DOM.Element.Table.ToggleSelectMultipleCells(true, point);
		point = undefined;
		return;
	}

	const newRange = self.Utils.Range();
	newRange.SetStart(point.Start.Node, DOM.Utils.IsBr(point.Start.Node) ? 0 : point.Start.Offset);
	newRange.SetEnd(point.End.Node, DOM.Utils.IsBr(point.End.Node) ? 0 : point.End.Offset);
	CaretUtils.UpdateRange(newRange);
};

export const CreateFakeFigure = (editor: Editor, figure: HTMLElement, figureElement: HTMLElement): IFakeFigure => {
	const self = editor;
	const DOM = self.DOM;

	const Figure = DOM.Clone(figure);
	DOM.SetStyles(Figure, {
		position: 'relative',
		width: `${figure.offsetWidth}px`,
		height: `${figure.offsetHeight}px`,
	});

	const Table = DOM.Clone(figureElement, true);

	DOM.SetStyles(Table, {
		width: `${figureElement.offsetWidth}px`,
		height: `${figureElement.offsetHeight}px`
	});

	DOM.Insert(Figure, Table);

	return {
		Figure,
		Table,
	};
};

export const MakeAbsolute = (editor: Editor, fakeFigure: IFakeFigure, figure: HTMLElement, figureElement: HTMLElement) => {
	const self = editor;
	const DOM = self.DOM;

	if (DOM.HasStyle(figure, 'float')) DOM.SetAttr(figure, 'dump-float', DOM.GetStyle(figure, 'float'));
	if (DOM.HasStyle(figure, 'margin-left')) DOM.SetAttr(figure, 'dump-margin-left', DOM.GetStyle(figure, 'margin-left'));
	if (DOM.HasStyle(figure, 'margin-right')) DOM.SetAttr(figure, 'dump-margin-right', DOM.GetStyle(figure, 'margin-right'));

	DOM.SetStyles(figure, {
		position: 'absolute',
		left: `${getOriginalPosition(editor, fakeFigure, 'left')}px`,
		top: `${getOriginalPosition(editor, fakeFigure, 'top')}px`,
		width: `${fakeFigure.Figure.offsetWidth}px`,
		height: `${fakeFigure.Figure.offsetHeight}px`,
	});

	DOM.SetStyles(figureElement, {
		position: 'absolute',
		left: `${getOriginalMediaPosition(editor, fakeFigure, 'left')}px`,
		top: `${getOriginalMediaPosition(editor, fakeFigure, 'top')}px`,
		width: `${fakeFigure.Table.offsetWidth}px`,
		height: `${fakeFigure.Table.offsetHeight}px`,
	});

	DOM.SetAttr(figureElement, Options.ATTRIBUTE_ADJUSTING);
};

export const ResetAbsolute = (editor: Editor, figure: HTMLElement, figureElement: HTMLElement) => {
	const self = editor;
	const DOM = self.DOM;

	DOM.RemoveStyles(figureElement, 'position', 'left', 'top', 'width', 'height');
	DOM.RemoveStyles(figure, 'position', 'left', 'top', 'width', 'height');

	DOM.RemoveAttr(figureElement, Options.ATTRIBUTE_ADJUSTING);

	const dumpFloat = DOM.GetAttr(figure, 'dump-float');
	if (dumpFloat) {
		DOM.SetStyle(figure, 'float', dumpFloat);
		DOM.RemoveAttr(figure, 'dump-float');
	}
	const dumpMarginLeft = DOM.GetAttr(figure, 'dump-margin-left');
	if (dumpMarginLeft) {
		DOM.SetStyle(figure, 'margin-left', dumpMarginLeft);
		DOM.RemoveAttr(figure, 'dump-margin-left');
	}
	const dumpMarginRight = DOM.GetAttr(figure, 'dump-margin-right');
	if (dumpMarginRight) {
		DOM.SetStyle(figure, 'margin-right', dumpMarginRight);
		DOM.RemoveAttr(figure, 'dump-margin-right');
	}
};

export const WalkGrid = (grid: ITableGrid['Grid'], callback: (cell: HTMLElement) => void) =>
	Arr.Each(grid, row => Arr.Each(row, cell => callback(cell)));