import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import { FigureSelector } from '../formatter/Format';
import ImageTools from './tools/image/ImageTools';
import TableTools from './tools/table/TableTools';
import { ADJUSTABLE_LINE_HALF_SIZE, CreateAdjustableEdgeSize, CreateMovableHorizontalSize, GetClientSize } from './tools/Utils';

export interface IDOMTools {
	Create: (type: string, element: HTMLElement) => HTMLElement | null,
	RemoveAll: (except?: Element | null) => void,
	ChangePositions: () => void,
}

const DOMTools = (editor: Editor): IDOMTools => {
	const self = editor;
	const DOM = self.DOM;

	const image = ImageTools(self);
	const table = TableTools(self);

	const Create = (type: string, element: HTMLElement): HTMLElement | null => {
		switch (type) {
			case 'image':
			case 'img':
				return image.Create(element as HTMLImageElement);
			case 'table':
				return table.Create(element);
			default:
				return null;
		}
	};

	const RemoveAll = (except?: Element | null) => {
		image.RemoveAll(except);
		table.RemoveAll(except);
	};

	const ChangePositions = () => {
		Arr.Each(DOM.SelectAll({ attrs: ['data-movable'] }, self.GetBody()), movable => {
			const figure = DOM.Closest(movable, FigureSelector);
			const figureType = DOM.GetAttr(figure, 'type');
			if (!figure || !figureType) return;

			const figureElement = DOM.Select<HTMLElement>(figureType, figure);
			if (!figureElement) return;

			DOM.SetStyle(movable, 'left', CreateMovableHorizontalSize(figureElement.offsetLeft + figureElement.offsetWidth / 2, true));
		});

		const attributeLine = 'data-adjustable-line';

		Arr.Each(DOM.SelectAll({ attrs: [attributeLine] }, self.GetBody()), line => {
			const figure = DOM.Closest(line, FigureSelector);
			const figureType = DOM.GetAttr(figure, 'type');
			if (!figure || !figureType) return;

			const figureElement = DOM.Select<HTMLElement>(figureType, figure);
			if (!figureElement) return;

			const styles: Record<string, string> = {};
			const lineType = DOM.GetAttr(line, attributeLine);

			switch (figureType) {
				case 'table':
					const bWidth = lineType === 'width';
					styles.width = `${bWidth ? ADJUSTABLE_LINE_HALF_SIZE * 2 - 1 : figureElement.offsetWidth}px`;
					styles.height = `${bWidth ? figureElement.offsetHeight : ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`;
					styles.left = `${bWidth ? 0 : figureElement.offsetLeft}px`;
					styles.top = `${bWidth ? figureElement.offsetTop : 0}px`;
					break;
				case 'img':
					const bHorizontal = lineType === 'left' || lineType === 'right';
					styles.width = `${bHorizontal ? ADJUSTABLE_LINE_HALF_SIZE : GetClientSize(self, figureElement, 'width')}px`;
					styles.height = `${bHorizontal ? GetClientSize(self, figureElement, 'height') : ADJUSTABLE_LINE_HALF_SIZE}px`;
					styles.left = `${figureElement.offsetLeft + (lineType !== 'right' ? 0 : figureElement.offsetWidth) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`;
					styles.top = `${figureElement.offsetTop + (lineType !== 'bottom' ? 0 : figureElement.offsetHeight) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`;
					break;
			}

			DOM.SetStyles(line, styles);
		});

		Arr.Each(DOM.SelectAll({ attrs: ['data-adjustable-edge'] }, self.GetBody()), edge => {
			const figure = DOM.Closest(edge, FigureSelector);
			const figureType = DOM.GetAttr(figure, 'type');
			if (!figure || !figureType) return;

			const figureElement = DOM.Select<HTMLElement>(figureType, figure);
			if (!figureElement) return;

			const bLeft = DOM.HasAttr(edge, 'data-horizontal', 'left');
			const bTop = DOM.HasAttr(edge, 'data-vertical', 'top');

			DOM.SetStyles(edge, {
				left: CreateAdjustableEdgeSize(figureElement.offsetLeft + (bLeft ? 0 : figureElement.offsetWidth), true),
				top: CreateAdjustableEdgeSize(figureElement.offsetTop + (bTop ? 0 : figureElement.offsetHeight), true),
			});
		});
	};

	return {
		Create,
		RemoveAll,
		ChangePositions,
	};
};

export default DOMTools;