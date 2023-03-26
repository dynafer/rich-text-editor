import { Arr } from '@dynafer/utils';
import Options from '../../../Options';
import Editor from '../../Editor';
import { ENativeEvents } from '../../events/EventSetupUtils';

export const MOVABLE_ADDABLE_SIZE = 16;
export const ADJUSTABLE_EDGE_ADDABLE_SIZE = -6;
export const ADJUSTABLE_LINE_HALF_SIZE = 3;
export const ADJUSTABLE_LINE_ADDABLE_SIZE = -2;

export const GetClientSize = (editor: Editor, target: HTMLElement, type: 'width' | 'height'): number => editor.DOM.GetRect(target)?.[type] ?? 0;

export const CreateMovableHorizontalSize = <T extends boolean = false>(size: number, bWithPixel: T | false = false): T extends false ? number : string =>
	(bWithPixel
		? `${size - MOVABLE_ADDABLE_SIZE / 2}px`
		: size - MOVABLE_ADDABLE_SIZE / 2
	) as T extends false ? number : string;

export const CreateAdjustableEdgeSize = <T extends boolean = false>(size: number, bWithPixel: T | false = false): T extends false ? number : string =>
	(bWithPixel
		? `${size + ADJUSTABLE_EDGE_ADDABLE_SIZE}px`
		: size + ADJUSTABLE_EDGE_ADDABLE_SIZE
	) as T extends false ? number : string;

export const CreateAdjustableLineSize = <T extends boolean = false>(size: number, bWithPixel: T | false = false): T extends false ? number : string =>
	(bWithPixel
		? `${size + ADJUSTABLE_LINE_ADDABLE_SIZE}px`
		: size + ADJUSTABLE_LINE_ADDABLE_SIZE
	) as T extends false ? number : string;

export const RegisterAdjustingEvents = (editor: Editor, target: HTMLElement, adjustCallback: (event: MouseEvent) => void, finishCallback: (event: MouseEvent) => void) => {
	const self = editor;
	const DOM = self.DOM;

	DOM.SetAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING, '');
	self.Dispatch('adjust:start', target);

	const boundEvents: [boolean, (Window & typeof globalThis), ENativeEvents, EventListener][] = [];

	const removeEvents = () =>
		Arr.Each(boundEvents, boundEvent => {
			const off = boundEvent[0] ? self.GetRootDOM().Off : DOM.Off;
			off(boundEvent[1], boundEvent[2], boundEvent[3]);
		});

	const adjust = (event: MouseEvent) => {
		self.Dispatch('adjust:move', target);
		adjustCallback(event);
	};

	const finish = (event: MouseEvent) => {
		finishCallback(event);
		removeEvents();
		DOM.RemoveAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING);
		self.Dispatch('adjust:finish', target);
		self.Tools.DOM.ChangePositions();
	};

	Arr.Push(boundEvents,
		[false, DOM.Win, ENativeEvents.mousemove, adjust],
		[false, DOM.Win, ENativeEvents.mouseup, finish],
		[true, self.GetRootDOM().Win, ENativeEvents.mouseup, finish],
	);

	Arr.Each(boundEvents, boundEvent => {
		const on = boundEvent[0] ? self.GetRootDOM().On : DOM.On;
		on(boundEvent[1], boundEvent[2], boundEvent[3]);
	});
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
				case 'img':
					const bHorizontal = lineType === 'left' || lineType === 'right';
					styles.width = `${bHorizontal ? ADJUSTABLE_LINE_HALF_SIZE : GetClientSize(self, FigureElement, 'width')}px`;
					styles.height = `${bHorizontal ? GetClientSize(self, FigureElement, 'height') : ADJUSTABLE_LINE_HALF_SIZE}px`;
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
	});
};