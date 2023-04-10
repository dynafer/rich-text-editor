import { Arr } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { ENativeEvents } from '../../events/EventSetupUtils';
import { TEventListener } from '../DOM';

export const MOVABLE_ADDABLE_SIZE = 16;
export const ADJUSTABLE_EDGE_ADDABLE_SIZE = -6;
export const ADJUSTABLE_LINE_HALF_SIZE = 3;
export const ADJUSTABLE_LINE_ADDABLE_SIZE = ADJUSTABLE_LINE_HALF_SIZE - (ADJUSTABLE_LINE_HALF_SIZE * 2);
export const ADDABLE_TOOLS_MENU_TOP = 6;

const getSizeWithPixel = (size: number, bWithPixel: boolean) => bWithPixel ? `${size}px` : size;

export const GetClientSize = (editor: Editor,
	target: HTMLElement, type: 'width' | 'height'): number => editor.DOM.GetRect(target)?.[type] ?? 0;

export const CreateMovableHorizontalSize = <T extends boolean = false>(size: number, bWithPixel: T | false = false): T extends false ? number : string =>
	getSizeWithPixel(size - MOVABLE_ADDABLE_SIZE / 2, bWithPixel) as T extends false ? number : string;

export const CreateAdjustableEdgeSize = <T extends boolean = false>(size: number, bWithPixel: T | false = false): T extends false ? number : string =>
	getSizeWithPixel(size + ADJUSTABLE_EDGE_ADDABLE_SIZE, bWithPixel) as T extends false ? number : string;

export const CreateAdjustableLineSize = <T extends boolean = false>(size: number, bWithPixel: T | false = false): T extends false ? number : string =>
	getSizeWithPixel(size + ADJUSTABLE_LINE_ADDABLE_SIZE, bWithPixel) as T extends false ? number : string;

const getToolsMenu = (editor: Editor, target: HTMLElement): HTMLElement | null => {
	const DOM = editor.DOM;

	const { Figure } = DOM.Element.Figure.Find<HTMLElement>(target);
	if (!Figure) return null;

	return DOM.Select<HTMLElement>({ attrs: ['data-tools-menu'] }, Figure);
};
export const RegisterAdjustingEvents = (editor: Editor, target: HTMLElement, adjustCallback: TEventListener<'mousemove' | 'touchmove'>, finishCallback: TEventListener<'mouseup' | 'touchend'>) => {
	const self = editor;
	const DOM = self.DOM;

	self.SetAdjusting(true);
	self.Dispatch('Adjust:Start', target);
	DOM.Hide(getToolsMenu(self, target));

	const boundEvents: [(Window & typeof globalThis), ENativeEvents, EventListener][] = [];

	const removeEvents = () => Arr.WhileShift(boundEvents, boundEvent => DOM.Off(boundEvent[0], boundEvent[1], boundEvent[2]));

	const adjust = (event: MouseEvent | TouchEvent) => {
		self.Dispatch('Adjust:Move', target);
		adjustCallback(event);
	};

	const finish = (event: MouseEvent | TouchEvent) => {
		finishCallback(event);
		removeEvents();
		self.SetAdjusting(false);
		self.Dispatch('Adjust:Finish', target);
		DOM.Show(getToolsMenu(self, target));
		self.Tools.DOM.ChangePositions();
	};

	Arr.Push(boundEvents,
		[self.GetWin(), ENativeEvents.mousemove, adjust],
		[self.GetWin(), ENativeEvents.touchmove, adjust],
		[self.GetWin(), ENativeEvents.mouseup, finish],
		[self.GetWin(), ENativeEvents.touchend, finish],
		[window, ENativeEvents.mouseup, finish],
		[window, ENativeEvents.touchend, finish],
	);

	Arr.Each(boundEvents, boundEvent => DOM.On(boundEvent[0], boundEvent[1], boundEvent[2]));
};

export const ChangeAllPositions = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const figureTools = self.Tools.DOM.Manager.SelectTools(true);

	Arr.Each(figureTools, tools => {
		if (DOM.IsHidden(tools)) return;

		const { Figure, FigureType, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(tools);
		if (!Figure || !FigureType || !FigureElement) return;

		Arr.Each(DOM.SelectAll({ attrs: ['data-movable'] }, tools), movable =>
			DOM.SetStyle(movable, 'left', CreateMovableHorizontalSize(FigureElement.offsetLeft + FigureElement.offsetWidth / 2, true))
		);

		const attributeLine = 'data-adjustable-line';
		Arr.Each(DOM.SelectAll({ attrs: [attributeLine] }, tools), line => {
			const styles: Record<string, string> = {};
			const lineType = DOM.GetAttr(line, attributeLine);

			switch (FigureType) {
				case 'table':
					const bWidth = lineType === 'width';
					styles.width = `${bWidth ? ADJUSTABLE_LINE_HALF_SIZE * 2 - 1 : FigureElement.offsetWidth}px`;
					styles.height = `${bWidth ? FigureElement.offsetHeight : ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`;
					styles.left = `${bWidth ? 0 : FigureElement.offsetLeft}px`;
					styles.top = `${bWidth ? FigureElement.offsetTop : 0}px`;
					break;
				case 'media':
					const bHorizontal = lineType === 'left' || lineType === 'right';
					styles.width = `${bHorizontal ? ADJUSTABLE_LINE_HALF_SIZE : FigureElement.offsetWidth}px`;
					styles.height = `${bHorizontal ? FigureElement.offsetHeight : ADJUSTABLE_LINE_HALF_SIZE}px`;
					styles.left = `${FigureElement.offsetLeft + (lineType !== 'right' ? 0 : FigureElement.offsetWidth) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`;
					styles.top = `${FigureElement.offsetTop + (lineType !== 'bottom' ? 0 : FigureElement.offsetHeight) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`;
					break;
			}

			DOM.SetStyles(line, styles);
		});

		Arr.Each(DOM.SelectAll({ attrs: ['data-adjustable-edge'] }, tools), edge => {
			const bLeft = DOM.HasAttr(edge, 'data-horizontal', 'left');
			const bTop = DOM.HasAttr(edge, 'data-vertical', 'top');

			DOM.SetStyles(edge, {
				left: CreateAdjustableEdgeSize(FigureElement.offsetLeft + (bLeft ? 0 : FigureElement.offsetWidth), true),
				top: CreateAdjustableEdgeSize(FigureElement.offsetTop + (bTop ? 0 : FigureElement.offsetHeight), true),
			});
		});

		Arr.Each(DOM.SelectAll<HTMLElement>({ attrs: ['data-tools-menu'] }, tools), menu => {
			if (!DOM.HasAttr(Figure, Options.ATTRIBUTE_FOCUSED)) return DOM.Hide(menu);
			DOM.Show(menu);

			const newStyles: Record<string, string> = {};

			const figureRightPosition = Figure.offsetLeft + Figure.offsetWidth;
			const figureElementRightPosition = FigureElement.offsetLeft + FigureElement.offsetWidth;
			const halfWithDifference = (FigureElement.offsetWidth - menu.offsetWidth) / 2;
			const menuCentredLeftPosition = figureElementRightPosition - menu.offsetWidth - halfWithDifference;
			const menuCentredRightPosition = menuCentredLeftPosition + menu.offsetWidth;

			const bAsText = DOM.HasAttr(Figure, Options.ATTRIBUTE_AS_TEXT);
			const bOutOfBody = bAsText && figureRightPosition > DOM.Doc.body.offsetWidth;

			if (menuCentredLeftPosition < 0 && !bOutOfBody)
				newStyles.left = '0px';
			else if (menuCentredRightPosition > DOM.Doc.body.offsetWidth || bOutOfBody)
				newStyles.left = `${menuCentredLeftPosition + halfWithDifference}px`;
			else
				newStyles.left = `${menuCentredLeftPosition}px`;

			const yRange = self.GetWin().innerHeight + self.GetWin().scrollY;

			const predictMenuBottomSide = Figure.offsetTop + Figure.offsetHeight + menu.offsetHeight;

			newStyles.top = predictMenuBottomSide <= yRange
				? `${FigureElement.offsetTop + FigureElement.offsetHeight + ADDABLE_TOOLS_MENU_TOP}px`
				: `${FigureElement.offsetTop - menu.offsetHeight - ADDABLE_TOOLS_MENU_TOP}px`;

			DOM.SetStyles(menu, newStyles);
		});
	});
};