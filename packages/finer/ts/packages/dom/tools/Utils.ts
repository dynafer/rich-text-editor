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

export const RegisterAdjustingEvents = (editor: Editor, adjustCallback: (event: MouseEvent) => void, finishCallback: (event: MouseEvent) => void) => {
	const self = editor;
	const DOM = self.DOM;

	DOM.SetAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING, '');

	const boundEvents: [boolean, (Window & typeof globalThis), ENativeEvents, EventListener][] = [];

	const removeEvents = () =>
		Arr.Each(boundEvents, boundEvent => {
			const off = boundEvent[0] ? self.GetRootDOM().Off : DOM.Off;
			off(boundEvent[1], boundEvent[2], boundEvent[3]);
		});

	const finish = (event: MouseEvent) => {
		finishCallback(event);
		removeEvents();
		self.Tools.DOM.ChangePositions();
		DOM.RemoveAttr(self.GetBody(), Options.ATTRIBUTE_ADJUSTING);
	};

	Arr.Push(boundEvents,
		[false, DOM.Win, ENativeEvents.mousemove, adjustCallback],
		[false, DOM.Win, ENativeEvents.mouseup, finish],
		[true, self.GetRootDOM().Win, ENativeEvents.mouseup, finish],
	);

	Arr.Each(boundEvents, boundEvent => {
		const on = boundEvent[0] ? self.GetRootDOM().On : DOM.On;
		on(boundEvent[1], boundEvent[2], boundEvent[3]);
	});
};