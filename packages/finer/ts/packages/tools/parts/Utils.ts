import { NodeType } from '@dynafer/dom-control';
import { Arr } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { RegisterMoveFinishEvents, RegisterStartEvent } from '../Utils';

type TStartAdjustingEvent = (event: MouseEvent | Touch, figure: HTMLElement, figureElement: HTMLElement) => void;
type TAdjustingCallback = (event: MouseEvent | Touch) => void;

export const MOVABLE_ADDABLE_SIZE = 16;
export const ADJUSTABLE_EDGE_ADDABLE_SIZE = -6;
export const ADJUSTABLE_LINE_HALF_SIZE = 3;
export const ADJUSTABLE_LINE_ADDABLE_SIZE = ADJUSTABLE_LINE_HALF_SIZE - (ADJUSTABLE_LINE_HALF_SIZE * 2);
export const ADDABLE_TOOLS_MENU_TOP = 6;

const getSizeWithPixel = (size: number, bWithPixel: boolean) => bWithPixel ? `${size}px` : size;

export const GetClientSize = (editor: Editor, target: HTMLElement, type: 'width' | 'height'): number =>
	editor.DOM.GetRect(target)?.[type] ?? 0;

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

	return DOM.Select<HTMLElement>({ attrs: ['data-parts-menu'] }, Figure);
};

export const StartAdjustment = (editor: Editor, callback: TStartAdjustingEvent, ...targets: Element[]) => {
	const self = editor;
	const DOM = self.DOM;

	const startAdjusting = (event: MouseEvent | Touch) => {
		if (!NodeType.IsNode(event.target)) return;

		const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(event.target);
		if (!Figure || !FigureElement) return;

		self.Dispatch('Tools:Adjust:Start', FigureElement);
		callback(event, Figure, FigureElement);
	};

	RegisterStartEvent(self, startAdjusting, ...targets);
};

export const RegisterAdjustingEvents = (editor: Editor, target: HTMLElement, adjustCallback: TAdjustingCallback, finishCallback: TAdjustingCallback) => {
	const self = editor;
	const DOM = self.DOM;

	self.SetAdjusting(true);
	DOM.Hide(getToolsMenu(self, target));

	const move = (event: MouseEvent | Touch) => {
		self.Dispatch('Tools:Adjust:Move', target);
		adjustCallback(event);
	};

	const finish = (event: MouseEvent | Touch) => {
		finishCallback(event);
		self.SetAdjusting(false);
		self.Dispatch('Tools:Adjust:Finish', target);
		DOM.Show(getToolsMenu(self, target));
		self.Tools.Parts.ChangePositions();
	};

	RegisterMoveFinishEvents(self, move, finish);
};

export const ChangePartsMenuOptionList = (editor: Editor, menu: HTMLElement) => {
	const self = editor;
	const DOM = self.DOM;

	const optionLists = DOM.SelectAll<HTMLElement>({
		class: DOM.Utils.CreateUEID('options', false)
	}, menu);

	Arr.Each(optionLists, optionList => {
		const uiType = DOM.GetAttr(optionList, 'data-type');
		if (!uiType) return;

		const selection = DOM.Select<HTMLElement>({
			attrs: {
				dataType: uiType
			}
		}, menu);
		if (!selection) return;

		self.Formatter.UI.SetOptionListInToolsMenuCoordinate(self, selection, optionList);
	});
};

export const ChangeAllPositions = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const figureTools = self.Tools.Parts.Manager.SelectParts(true);

	Arr.Each(figureTools, parts => {
		if (DOM.IsHidden(parts)) return;

		const { Figure, FigureType, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(parts);
		if (!Figure || !FigureType || !FigureElement) return;

		Arr.Each(DOM.SelectAll({ attrs: ['data-movable'] }, parts), movable =>
			DOM.SetStyle(movable, 'left', CreateMovableHorizontalSize(FigureElement.offsetLeft + FigureElement.offsetWidth / 2, true))
		);

		const attributeLine = 'data-adjustable-line';
		Arr.Each(DOM.SelectAll({ attrs: [attributeLine] }, parts), line => {
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

		Arr.Each(DOM.SelectAll({ attrs: ['data-adjustable-edge'] }, parts), edge => {
			const bLeft = DOM.HasAttr(edge, 'data-horizontal', 'left');
			const bTop = DOM.HasAttr(edge, 'data-vertical', 'top');

			DOM.SetStyles(edge, {
				left: CreateAdjustableEdgeSize(FigureElement.offsetLeft + (bLeft ? 0 : FigureElement.offsetWidth), true),
				top: CreateAdjustableEdgeSize(FigureElement.offsetTop + (bTop ? 0 : FigureElement.offsetHeight), true),
			});
		});

		Arr.Each(DOM.SelectAll<HTMLElement>({ attrs: ['data-parts-menu'] }, parts), menu => {
			if (!DOM.HasAttr(Figure, Options.ATTRIBUTE_FOCUSED)) return DOM.Hide(menu);
			DOM.Show(menu);

			const newStyles: Record<string, string> = {};

			const figureRightPosition = Figure.offsetLeft + Figure.offsetWidth;
			const figureElementRightPosition = FigureElement.offsetLeft + FigureElement.offsetWidth;
			const halfDifference = (FigureElement.offsetWidth - menu.offsetWidth) / 2;
			const menuCentredLeftPosition = figureElementRightPosition - menu.offsetWidth - halfDifference;
			const menuCentredRightPosition = menuCentredLeftPosition + menu.offsetWidth;

			const bAsText = DOM.HasAttr(Figure, Options.ATTRIBUTE_AS_TEXT);
			const bOutOfBody = bAsText && figureRightPosition > DOM.Doc.body.offsetWidth;

			if (menuCentredLeftPosition < 0 && !bOutOfBody)
				newStyles.left = '0px';
			else if (menuCentredRightPosition > DOM.Doc.body.offsetWidth || bOutOfBody)
				newStyles.left = `${menuCentredLeftPosition + halfDifference}px`;
			else
				newStyles.left = `${menuCentredLeftPosition}px`;

			const yRange = self.GetWin().innerHeight + self.GetWin().scrollY;

			const predictMenuBottomSide = Figure.offsetTop + Figure.offsetHeight + menu.offsetHeight;

			newStyles.top = predictMenuBottomSide <= yRange
				? `${FigureElement.offsetTop + FigureElement.offsetHeight + ADDABLE_TOOLS_MENU_TOP}px`
				: `${FigureElement.offsetTop - menu.offsetHeight - ADDABLE_TOOLS_MENU_TOP}px`;

			DOM.SetStyles(menu, newStyles);

			ChangePartsMenuOptionList(self, menu);
		});
	});
};