import Editor from '../../../Editor';
import { ADJUSTABLE_LINE_HALF_SIZE, GetClientSize } from '../Utils';

const AdjustableLine = (editor: Editor, image: HTMLImageElement): HTMLElement => {
	const self = editor;
	const DOM = self.DOM;

	const adjustableLineGroup = DOM.Create('div', {
		attrs: {
			dataAdjustableLineGroup: '',
		},
	});

	const createAdjustableLine = (type: 'left' | 'top' | 'right' | 'bottom'): HTMLElement => {
		const bHorizontal = type === 'left' || type === 'right';
		return DOM.Create('div', {
			attrs: {
				dataAdjustableLine: type,
			},
			styles: {
				width: `${bHorizontal ? ADJUSTABLE_LINE_HALF_SIZE : GetClientSize(self, image, 'width')}px`,
				height: `${bHorizontal ? GetClientSize(self, image, 'height') : ADJUSTABLE_LINE_HALF_SIZE}px`,
				left: `${image.offsetLeft + (type !== 'right' ? 0 : image.offsetWidth) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`,
				top: `${image.offsetTop + (type !== 'bottom' ? 0 : image.offsetHeight) - ADJUSTABLE_LINE_HALF_SIZE / 2}px`,
			}
		});
	};

	const adjustableLeft = createAdjustableLine('left');
	const adjustableTop = createAdjustableLine('top');
	const adjustableRight = createAdjustableLine('right');
	const adjustableBottom = createAdjustableLine('bottom');

	// TODO: Create events for adjustable lines

	DOM.Insert(adjustableLineGroup, adjustableLeft, adjustableTop, adjustableRight, adjustableBottom);

	return adjustableLineGroup;
};

export default AdjustableLine;