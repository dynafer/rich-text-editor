import Editor from '../../../Editor';

interface IFakeFigure {
	Figure: HTMLElement,
	Image: HTMLElement,
}

const getComputedMargin = (editor: Editor, selector: HTMLElement, type: 'left' | 'top'): number =>
	parseFloat(editor.DOM.GetStyle(selector, `margin-${type}`, true));

const getOriginalPosition = (editor: Editor, fakeFigure: IFakeFigure, type: 'left' | 'top') =>
	(type === 'left' ? fakeFigure.Figure.offsetLeft : fakeFigure.Figure.offsetTop)
	- getComputedMargin(editor, fakeFigure.Figure, type);

const getOriginalImagePosition = (editor: Editor, fakeFigure: IFakeFigure, type: 'left' | 'top') =>
	getComputedMargin(editor, fakeFigure.Image, type);

export const CreateFakeFigure = (editor: Editor, figure: HTMLElement, image: HTMLImageElement): IFakeFigure => {
	const self = editor;
	const DOM = self.DOM;

	const Figure = DOM.Clone(figure);
	DOM.SetStyles(Figure, {
		position: 'relative',
		width: `${figure.offsetWidth}px`,
		height: `${figure.offsetHeight}px`,
	});

	const Image = DOM.Create('div', {
		attrs: {
			dataFake: ''
		}
	});

	DOM.SetStyles(Image, {
		width: `${image.offsetWidth}px`,
		height: `${image.offsetHeight}px`
	});

	DOM.Insert(Figure, Image);

	return {
		Figure,
		Image,
	};
};

export const MakeAbsolute = (editor: Editor, fakeFigure: IFakeFigure, figure: HTMLElement, image: HTMLImageElement) => {
	const self = editor;
	const DOM = self.DOM;

	DOM.SetStyles(figure, {
		position: 'absolute',
		width: `${fakeFigure.Figure.offsetWidth}px`,
		height: `${fakeFigure.Figure.offsetHeight}px`,
		left: `${getOriginalPosition(editor, fakeFigure, 'left')}px`,
		top: `${getOriginalPosition(editor, fakeFigure, 'top')}px`,
	});

	DOM.SetStyles(image, {
		position: 'absolute',
		left: `${getOriginalImagePosition(editor, fakeFigure, 'left')}px`,
		top: `${getOriginalImagePosition(editor, fakeFigure, 'top')}px`,
	});
};

export const ResetAbsolute = (editor: Editor, figure: HTMLElement, image: HTMLImageElement) => {
	const self = editor;
	const DOM = self.DOM;

	DOM.RemoveStyle(image, 'position');
	DOM.RemoveStyle(image, 'left');
	DOM.RemoveStyle(image, 'top');

	DOM.RemoveStyle(figure, 'position');
	DOM.RemoveStyle(figure, 'left');
	DOM.RemoveStyle(figure, 'top');
	DOM.RemoveStyle(figure, 'width');
	DOM.RemoveStyle(figure, 'height');
};