import { Arr } from '@dynafer/utils';
import { ENativeEvents, PreventEvent } from '../../../events/EventSetupUtils';
import Editor from '../../../Editor';
import { CreateAdjustableEdgeSize, CreateCurrentPoint, CreateFakeTable, CreateMovableHorizontalSize, MoveToCurrentPoint } from './TableToolsUtils';

const AdjustableEdge = (editor: Editor, table: HTMLElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;

	const adjustableEdgeGroup = DOM.Create('div', {
		attrs: {
			dataAdjustableEdgeGroup: '',
		},
	});

	const createCommonEdge = (type: 'west' | 'east', bRight: boolean, bBottom: boolean): HTMLElement =>
		DOM.Create('div', {
			attrs: {
				dataAdjustableEdge: type,
				dataHorizontal: !bRight ? 'left' : 'right',
				dataVertical: !bBottom ? 'top' : 'bottom',
			},
			styles: {
				left: CreateAdjustableEdgeSize(table.offsetLeft + (!bRight ? 0 : table.offsetWidth), true),
				top: CreateAdjustableEdgeSize(table.offsetTop + (!bBottom ? 0 : table.offsetHeight), true),
			},
		});

	const leftTopEdge = createCommonEdge('west', false, false);
	const rightTopEdge = createCommonEdge('east', true, false);
	const leftBottomEdge = createCommonEdge('east', false, true);
	const rightBottomEdge = createCommonEdge('west', true, true);

	const setEdgePositionStyles = (targetTable: HTMLElement, element: HTMLElement, bRight: boolean, bBottom: boolean) =>
		DOM.SetStyles(element, {
			left: CreateAdjustableEdgeSize(targetTable.offsetLeft + (!bRight ? 0 : targetTable.offsetWidth), true),
			top: CreateAdjustableEdgeSize(targetTable.offsetTop + (!bBottom ? 0 : targetTable.offsetHeight), true),
		});

	const startAdjusting = (event: MouseEvent) => {
		PreventEvent(event);

		let savedPoint = CreateCurrentPoint(self, table);

		const moveToSavedPoint = () => {
			MoveToCurrentPoint(self, table, savedPoint);
			savedPoint = undefined;
		};

		let startOffsetX = event.clientX;
		let startOffsetY = event.clientY;

		const bLeft = event.target === leftTopEdge || event.target === leftBottomEdge;
		const bTop = event.target === leftTopEdge || event.target === rightTopEdge;

		const fakeTable = CreateFakeTable(self, table);
		DOM.SetStyles(fakeTable, {
			width: '0px',
			height: '0px',
		});
		DOM.Insert(adjustableEdgeGroup, fakeTable);

		const minWidth = fakeTable.offsetWidth;
		const minHeight = fakeTable.offsetHeight;
		const minLeft = fakeTable.offsetLeft - (bLeft ? (table.offsetWidth - minWidth) * -1 : 0);
		const minTop = fakeTable.offsetTop - (bTop ? (table.offsetHeight - minHeight) * -1 : 0);

		DOM.SetStyles(fakeTable, {
			width: `${table.offsetWidth}px`,
			height: `${table.offsetHeight}px`,
		});

		const boundEvents: [boolean, HTMLElement, ENativeEvents, (e: Event) => void][] = [];

		const removeEvents = () => {
			for (const boundEvent of boundEvents) {
				const off = boundEvent[0] ? self.GetRootDOM().Off : DOM.Off;
				off(boundEvent[1], boundEvent[2], boundEvent[3]);
			}
		};

		const adjust = (e: MouseEvent) => {
			PreventEvent(e);

			const currentOffsetX = e.clientX;
			const currentOffsetY = e.clientY;

			const calculatedX = bLeft ? startOffsetX - currentOffsetX : currentOffsetX - startOffsetX;
			const calculatedY = bTop ? startOffsetY - currentOffsetY : currentOffsetY - startOffsetY;

			const newWidth = fakeTable.offsetWidth + calculatedX;
			const newHeight = fakeTable.offsetHeight + calculatedY;

			const newStyles: Record<string, string> = {
				width: `${minWidth}px`,
				height: `${minHeight}px`,
				left: `${minLeft}px`,
				top: `${minTop}px`,
			};

			if (newWidth > minWidth) {
				newStyles.width = `${newWidth}px`;
				const newLeft = fakeTable.offsetLeft - (bLeft ? calculatedX : 0);
				newStyles.left = `${newLeft}px`;
				startOffsetX = currentOffsetX;
			}

			if (newHeight > minHeight) {
				newStyles.height = `${newHeight}px`;
				const newTop = fakeTable.offsetTop - (bTop ? calculatedY : 0);
				newStyles.top = `${newTop}px`;
				startOffsetY = currentOffsetY;
			}

			if (calculatedX === 0) {
				delete newStyles.width;
				delete newStyles.left;
			}

			if (calculatedY === 0) {
				delete newStyles.height;
				delete newStyles.top;
			}

			DOM.SetStyles(fakeTable, newStyles);

			DOM.Hide(DOM.Select({ attrs: ['data-movable'] }, table.parentNode) as HTMLElement);
			setEdgePositionStyles(fakeTable, leftTopEdge, false, false);
			setEdgePositionStyles(fakeTable, rightTopEdge, true, false);
			setEdgePositionStyles(fakeTable, leftBottomEdge, false, true);
			setEdgePositionStyles(fakeTable, rightBottomEdge, true, true);
		};

		const finishAdjusting = (e: MouseEvent) => {
			PreventEvent(e);
			removeEvents();

			const newWidth = fakeTable.offsetWidth;
			const newHeight = fakeTable.offsetHeight;

			DOM.Remove(fakeTable);

			const newStyles: Record<string, string> = {};

			if (newWidth !== table.offsetWidth) newStyles.width = `${newWidth}px`;
			if (newHeight !== table.offsetHeight) newStyles.height = `${newHeight}px`;

			DOM.SetStyles(table, newStyles);

			const movable = DOM.Select({ attrs: ['data-movable'] }, table.parentNode) as HTMLElement;
			DOM.Show(movable);
			DOM.SetStyle(movable, 'left', CreateMovableHorizontalSize(table.offsetLeft, true));
			setEdgePositionStyles(table, leftTopEdge, false, false);
			setEdgePositionStyles(table, rightTopEdge, true, false);
			setEdgePositionStyles(table, leftBottomEdge, false, true);
			setEdgePositionStyles(table, rightBottomEdge, true, true);

			moveToSavedPoint();
		};

		Arr.Push(boundEvents,
			[false, self.GetBody(), ENativeEvents.mousemove, adjust],
			[false, self.GetBody(), ENativeEvents.mouseup, finishAdjusting],
			[true, self.GetRootDOM().GetRoot(), ENativeEvents.mousemove, finishAdjusting],
		);

		for (const boundEvent of boundEvents) {
			const on = boundEvent[0] ? self.GetRootDOM().On : DOM.On;
			on(boundEvent[1], boundEvent[2], boundEvent[3]);
		}
	};

	const edges = [leftTopEdge, rightTopEdge, leftBottomEdge, rightBottomEdge];
	for (const edge of edges) {
		DOM.On(edge, ENativeEvents.mousedown, startAdjusting);
	}

	DOM.Insert(adjustableEdgeGroup, ...edges);

	return adjustableEdgeGroup;
};

export default AdjustableEdge;