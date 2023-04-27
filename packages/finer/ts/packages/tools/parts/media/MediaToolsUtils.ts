import Editor from '../../../Editor';

interface IFakeFigure {
	readonly Figure: HTMLElement,
	readonly Media: HTMLElement,
}

const getComputedMargin = (editor: Editor, selector: HTMLElement, type: 'left' | 'top'): number =>
	parseFloat(editor.DOM.GetStyle(selector, `margin-${type}`, true));

const getOriginalPosition = (editor: Editor, fakeFigure: IFakeFigure, type: 'left' | 'top'): number =>
	(type === 'left' ? fakeFigure.Figure.offsetLeft : fakeFigure.Figure.offsetTop)
	- getComputedMargin(editor, fakeFigure.Figure, type);

const getOriginalMediaPosition = (editor: Editor, fakeFigure: IFakeFigure, type: 'left' | 'top'): number =>
	getComputedMargin(editor, fakeFigure.Media, type);

export const CreateFakeFigure = (editor: Editor, figure: HTMLElement, figureElement: HTMLElement): IFakeFigure => {
	const self = editor;
	const DOM = self.DOM;

	const Figure = DOM.Clone(figure);
	DOM.SetStyles(Figure, {
		position: 'relative',
		width: `${figure.offsetWidth}px`,
		height: `${figure.offsetHeight}px`,
	});

	const Media = DOM.Create('div', {
		attrs: ['data-fake']
	});

	DOM.SetStyles(Media, {
		width: `${figureElement.offsetWidth}px`,
		height: `${figureElement.offsetHeight}px`
	});

	DOM.Insert(Figure, Media);

	return {
		Figure,
		Media,
	};
};

export const CreateFakeMedia = (editor: Editor, figureElement: HTMLElement) =>
	editor.DOM.Create('div', {
		attrs: {
			dataOriginalWidth: editor.DOM.GetAttr(figureElement, 'data-original-width') ?? '0',
			dataOriginalHeight: editor.DOM.GetAttr(figureElement, 'data-original-height') ?? '0',
		},
		styles: {
			backgroundColor: 'rgba(0, 0, 0, 0.7)',
			width: editor.DOM.GetStyle(figureElement, 'width'),
			height: editor.DOM.GetStyle(figureElement, 'height'),
		}
	});

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
	});
};

export const ResetAbsolute = (editor: Editor, figure: HTMLElement, figureElement: HTMLElement) => {
	const self = editor;
	const DOM = self.DOM;

	DOM.RemoveStyles(figureElement, 'position', 'left', 'top');
	DOM.RemoveStyles(figure, 'position', 'left', 'top', 'width', 'height');

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